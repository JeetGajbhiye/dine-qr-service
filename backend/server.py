"""
Restaurant QR Menu - FastAPI backend (mirror of Spring Boot API).
Exposes the same endpoints as the Java version so the same React frontend works.
"""
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---- Config ----
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "ChangeThisSuperSecretKeyForJWTThatIsAtLeast32CharsLong!")
JWT_ALGO = "HS256"
JWT_EXP_HOURS = 24
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "admin@123")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Restaurant QR Menu API")
api = APIRouter(prefix="/api")

log = logging.getLogger("restaurant")
logging.basicConfig(level=logging.INFO)


# ---- Models ----
class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    nameHi: Optional[str] = None
    nameTa: Optional[str] = None
    description: Optional[str] = None
    descriptionHi: Optional[str] = None
    descriptionTa: Optional[str] = None
    price: float
    imageUrl: Optional[str] = None
    category: str
    isAvailable: bool = True
    isVeg: bool = True


class OrderItem(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    menuItemId: Optional[str] = None
    name: str
    price: float
    quantity: int


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerEmail: Optional[str] = None
    tableNumber: Optional[str] = None
    grandTotal: float
    status: str = "PENDING"
    paymentId: Optional[str] = None
    paymentMethod: Optional[str] = None
    items: List[OrderItem] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderRequest(BaseModel):
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerEmail: Optional[str] = None
    tableNumber: Optional[str] = None
    grandTotal: float
    paymentId: Optional[str] = None
    paymentMethod: Optional[str] = None
    items: List[OrderItem] = []


class RestaurantTable(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tableNumber: str
    label: Optional[str] = None
    qrUrl: Optional[str] = None
    isActive: bool = True


class LoginBody(BaseModel):
    username: str
    password: str


# ---- Helpers ----
def serialize(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    if isinstance(doc.get("createdAt"), str):
        try:
            doc["createdAt"] = datetime.fromisoformat(doc["createdAt"])
        except Exception:
            pass
    return doc


def make_token(username: str) -> str:
    payload = {"sub": username, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload.get("sub")
    except Exception:
        return None


async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization[7:]
    username = verify_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username


# ---- Auth ----
@api.post("/auth/login")
async def login(body: LoginBody):
    admin = await db.admin_users.find_one({"username": body.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(body.password.encode(), admin["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": make_token(body.username), "username": body.username, "role": "ADMIN"}


@api.get("/auth/me")
async def me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    username = verify_token(authorization[7:])
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": username}


# ---- Menu ----
@api.get("/menu", response_model=List[MenuItem])
async def get_menu(category: Optional[str] = None):
    q = {}
    if category and category != "All":
        q["category"] = category
    docs = await db.menu_items.find(q, {"_id": 0}).to_list(1000)
    return docs


@api.post("/menu", response_model=MenuItem)
async def create_menu(item: MenuItem, admin: str = Depends(require_admin)):
    doc = item.model_dump()
    await db.menu_items.insert_one(doc.copy())
    return item


@api.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu(item_id: str, item: MenuItem, admin: str = Depends(require_admin)):
    doc = item.model_dump()
    doc["id"] = item_id
    await db.menu_items.update_one({"id": item_id}, {"$set": doc})
    return MenuItem(**doc)


@api.delete("/menu/{item_id}")
async def delete_menu(item_id: str, admin: str = Depends(require_admin)):
    await db.menu_items.delete_one({"id": item_id})
    return {"ok": True}


# ---- Orders ----
@api.post("/orders", response_model=Order)
async def place_order(body: OrderRequest):
    order = Order(
        customerName=body.customerName,
        customerPhone=body.customerPhone,
        customerEmail=body.customerEmail,
        tableNumber=body.tableNumber,
        grandTotal=body.grandTotal,
        paymentId=body.paymentId,
        paymentMethod=body.paymentMethod,
        items=body.items,
        status="PAID" if body.paymentId else "PENDING",
    )
    doc = order.model_dump()
    doc["createdAt"] = doc["createdAt"].isoformat()
    await db.orders.insert_one(doc.copy())
    return order


@api.get("/orders", response_model=List[Order])
async def get_orders(admin: str = Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for d in docs:
        serialize(d)
    return docs


@api.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize(doc)


@api.patch("/orders/{order_id}/status", response_model=Order)
async def update_status(order_id: str, body: dict = Body(...), admin: str = Depends(require_admin)):
    status = body.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="status required")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return serialize(doc)


@api.delete("/orders/{order_id}")
async def delete_order(order_id: str, admin: str = Depends(require_admin)):
    await db.orders.delete_one({"id": order_id})
    return {"ok": True}


# ---- Tables ----
@api.get("/tables", response_model=List[RestaurantTable])
async def get_tables(admin: str = Depends(require_admin)):
    docs = await db.tables.find({}, {"_id": 0}).to_list(1000)
    return docs


@api.post("/tables", response_model=RestaurantTable)
async def create_table(t: RestaurantTable, admin: str = Depends(require_admin)):
    exists = await db.tables.find_one({"tableNumber": t.tableNumber})
    if exists:
        raise HTTPException(status_code=400, detail="Table number already exists")
    doc = t.model_dump()
    await db.tables.insert_one(doc.copy())
    return t


@api.delete("/tables/{table_id}")
async def delete_table(table_id: str, admin: str = Depends(require_admin)):
    await db.tables.delete_one({"id": table_id})
    return {"ok": True}


# ---- Seed data ----
SAMPLE_MENU = [
    ("Paneer Tikka", "पनीर टिक्का", "பன்னீர் டிக்கா",
     "Char-grilled cottage cheese cubes marinated in yogurt & spices.", 249,
     "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", "Starters", True),
    ("Chicken 65", "चिकन 65", "சிக்கன் 65",
     "Crispy South Indian style spicy fried chicken.", 289,
     "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", "Starters", False),
    ("Veg Spring Rolls", "वेज स्प्रिंग रोल", "காய்கறி ரோல்",
     "Crispy rolls stuffed with fresh vegetables served with sweet chilli sauce.", 199,
     "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", "Starters", True),
    ("Butter Chicken", "बटर चिकन", "பட்டர் சிக்கன்",
     "Creamy tomato gravy with tender chicken pieces.", 349,
     "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800", "Main Course", False),
    ("Paneer Butter Masala", "पनीर बटर मसाला", "பன்னீர் பட்டர் மசாலா",
     "Rich, buttery paneer curry with a touch of cream.", 299,
     "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800", "Main Course", True),
    ("Veg Biryani", "वेज बिरयानी", "காய்கறி பிரியாணி",
     "Aromatic basmati rice cooked with vegetables and spices.", 229,
     "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800", "Main Course", True),
    ("Chicken Biryani", "चिकन बिरयानी", "சிக்கன் பிரியாணி",
     "Hyderabadi style dum-cooked chicken biryani.", 329,
     "https://images.unsplash.com/photo-1633945274309-2c16c976d5cc?w=800", "Main Course", False),
    ("Dal Makhani", "दाल मखनी", "தால் மகனி",
     "Slow-cooked black lentils in creamy tomato gravy.", 249,
     "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800", "Main Course", True),
    ("Masala Chai", "मसाला चाय", "மசாலா டீ",
     "Indian spiced milk tea.", 49,
     "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800", "Beverages", True),
    ("Fresh Lime Soda", "नीम्बू सोडा", "எலுமிச்சை சோடா",
     "Refreshing lime with sparkling soda.", 69,
     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800", "Beverages", True),
    ("Mango Lassi", "आम लस्सी", "மாம்பழம் லஸ்ஸி",
     "Thick, creamy yogurt drink with sweet mango.", 99,
     "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800", "Beverages", True),
    ("Gulab Jamun", "गुलाब जामुन", "குலாப் ஜாமூன்",
     "Warm milk-solid dumplings soaked in cardamom syrup.", 99,
     "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800", "Desserts", True),
    ("Rasmalai", "रसमलाई", "ரஸ்மலாய்",
     "Soft cottage cheese patties in saffron milk.", 119,
     "https://images.unsplash.com/photo-1594149929911-78975a43d4f5?w=800", "Desserts", True),
]


@app.on_event("startup")
async def seed():
    # seed admin
    if not await db.admin_users.find_one({"username": ADMIN_USER}):
        hashed = bcrypt.hashpw(ADMIN_PASS.encode(), bcrypt.gensalt()).decode()
        await db.admin_users.insert_one({"username": ADMIN_USER, "password": hashed, "role": "ADMIN"})
        log.info(f">>> Admin seeded: {ADMIN_USER} / {ADMIN_PASS}")
    # seed menu
    if await db.menu_items.count_documents({}) == 0:
        for (name, name_hi, name_ta, desc, price, img, cat, veg) in SAMPLE_MENU:
            item = MenuItem(
                name=name, nameHi=name_hi, nameTa=name_ta,
                description=desc, descriptionHi=desc, descriptionTa=desc,
                price=price, imageUrl=img, category=cat, isAvailable=True, isVeg=veg,
            )
            await db.menu_items.insert_one(item.model_dump())
        log.info(f">>> Seeded {len(SAMPLE_MENU)} menu items")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
