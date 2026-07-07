"""
Comprehensive Backend API Tests for Restaurant QR Menu App
Tests all endpoints: auth, menu, orders, tables
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://dine-qr-app-5.preview.emergentagent.com/api"
ADMIN_USER = "admin"
ADMIN_PASS = "admin@123"

class APITester:
    def __init__(self):
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.menu_item_id = None
        self.order_id = None
        self.table_id = None

    def log(self, emoji, message):
        print(f"{emoji} {message}")

    def test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        h = {"Content-Type": "application/json"}
        if headers:
            h.update(headers)
        
        self.tests_run += 1
        self.log("🔍", f"Testing: {name}")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=h, params=params, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=h, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=h, timeout=10)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=h, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=h, timeout=10)
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log("✅", f"PASSED - {name} (Status: {response.status_code})")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.tests_failed += 1
                error_msg = f"FAILED - {name} | Expected {expected_status}, got {response.status_code}"
                try:
                    error_msg += f" | Response: {response.text[:200]}"
                except:
                    pass
                self.log("❌", error_msg)
                self.failures.append({"test": name, "expected": expected_status, "actual": response.status_code, "endpoint": endpoint})
                return False, {}
                
        except Exception as e:
            self.tests_failed += 1
            error_msg = f"FAILED - {name} | Error: {str(e)}"
            self.log("❌", error_msg)
            self.failures.append({"test": name, "error": str(e), "endpoint": endpoint})
            return False, {}

    def run_all_tests(self):
        self.log("🚀", "Starting Backend API Tests")
        self.log("📍", f"Base URL: {BASE_URL}")
        print("=" * 80)
        
        # ===== AUTH TESTS =====
        print("\n" + "=" * 80)
        self.log("🔐", "TESTING AUTH ENDPOINTS")
        print("=" * 80)
        
        # Test 1: Login with wrong credentials (should fail)
        success, _ = self.test(
            "POST /auth/login with wrong credentials",
            "POST", "/auth/login", 401,
            data={"username": "wrong", "password": "wrong"}
        )
        
        # Test 2: Login with correct credentials
        success, response = self.test(
            "POST /auth/login with admin/admin@123",
            "POST", "/auth/login", 200,
            data={"username": ADMIN_USER, "password": ADMIN_PASS}
        )
        
        if success and "token" in response:
            self.token = response["token"]
            self.log("🎫", f"Token obtained: {self.token[:20]}...")
        else:
            self.log("⚠️", "Failed to get token - protected endpoint tests will fail")
            
        # Test 3: GET /auth/me with valid token
        if self.token:
            success, response = self.test(
                "GET /auth/me with valid token",
                "GET", "/auth/me", 200,
                headers={"Authorization": f"Bearer {self.token}"}
            )
            if success and response.get("username") == ADMIN_USER:
                self.log("✨", f"Auth verified for user: {response.get('username')}")
        
        # Test 4: GET /auth/me without token (should fail)
        self.test(
            "GET /auth/me without token (should return 401)",
            "GET", "/auth/me", 401
        )
        
        # ===== MENU TESTS =====
        print("\n" + "=" * 80)
        self.log("🍽️", "TESTING MENU ENDPOINTS")
        print("=" * 80)
        
        # Test 5: GET all menu items (public)
        success, response = self.test(
            "GET /menu returns all items",
            "GET", "/menu", 200
        )
        
        if success:
            item_count = len(response) if isinstance(response, list) else 0
            self.log("📊", f"Found {item_count} menu items (expected 13)")
            if item_count == 13:
                self.log("✨", "Correct number of seeded items!")
                # Verify first item has required fields
                if item_count > 0:
                    item = response[0]
                    required_fields = ["id", "name", "nameHi", "nameTa", "price", "imageUrl", "category", "isAvailable", "isVeg"]
                    missing = [f for f in required_fields if f not in item]
                    if not missing:
                        self.log("✨", "Menu items have all required fields")
                    else:
                        self.log("⚠️", f"Menu items missing fields: {missing}")
            else:
                self.log("⚠️", f"Expected 13 items but got {item_count}")
        
        # Test 6: GET menu filtered by category
        success, response = self.test(
            "GET /menu?category=Starters returns filtered items",
            "GET", "/menu", 200,
            params={"category": "Starters"}
        )
        
        if success and isinstance(response, list):
            starters_count = len(response)
            self.log("📊", f"Found {starters_count} Starters")
            # Verify all are actually Starters
            if all(item.get("category") == "Starters" for item in response):
                self.log("✨", "Category filter working correctly")
            else:
                self.log("⚠️", "Category filter returned wrong items")
        
        # Test 7: POST /menu without auth (should fail)
        self.test(
            "POST /menu without auth (should return 401)",
            "POST", "/menu", 401,
            data={
                "name": "Test Item",
                "price": 99.0,
                "category": "Starters",
                "isAvailable": True,
                "isVeg": True
            }
        )
        
        # Test 8: POST /menu with auth (create new item)
        if self.token:
            success, response = self.test(
                "POST /menu with auth creates new item",
                "POST", "/menu", 200,
                data={
                    "name": "Test Dish",
                    "nameHi": "टेस्ट डिश",
                    "nameTa": "டெஸ்ட் டிஷ்",
                    "description": "Test description",
                    "price": 199.0,
                    "imageUrl": "https://via.placeholder.com/400",
                    "category": "Starters",
                    "isAvailable": True,
                    "isVeg": True
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success and "id" in response:
                self.menu_item_id = response["id"]
                self.log("🆔", f"Created menu item with ID: {self.menu_item_id}")
        
        # Test 9: PUT /menu/{id} with auth (update item)
        if self.token and self.menu_item_id:
            success, response = self.test(
                "PUT /menu/{id} with auth updates item",
                "PUT", f"/menu/{self.menu_item_id}", 200,
                data={
                    "id": self.menu_item_id,
                    "name": "Updated Test Dish",
                    "nameHi": "अपडेटेड टेस्ट डिश",
                    "nameTa": "புதுப்பிக்கப்பட்ட டெஸ்ட் டிஷ்",
                    "description": "Updated description",
                    "price": 249.0,
                    "imageUrl": "https://via.placeholder.com/400",
                    "category": "Main Course",
                    "isAvailable": False,
                    "isVeg": True
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success:
                self.log("✨", "Menu item updated successfully")
        
        # Test 10: DELETE /menu/{id} without auth (should fail)
        if self.menu_item_id:
            self.test(
                "DELETE /menu/{id} without auth (should return 401)",
                "DELETE", f"/menu/{self.menu_item_id}", 401
            )
        
        # ===== ORDER TESTS =====
        print("\n" + "=" * 80)
        self.log("📦", "TESTING ORDER ENDPOINTS")
        print("=" * 80)
        
        # Test 11: POST /orders (public - create order without payment)
        success, response = self.test(
            "POST /orders creates order with status PENDING",
            "POST", "/orders", 200,
            data={
                "customerName": "Test Customer",
                "customerPhone": "9876543210",
                "customerEmail": "test@example.com",
                "tableNumber": "T1",
                "grandTotal": 500.0,
                "items": [
                    {"name": "Paneer Tikka", "price": 249.0, "quantity": 2}
                ]
            }
        )
        
        if success and "id" in response:
            self.order_id = response["id"]
            order_status = response.get("status")
            self.log("🆔", f"Created order with ID: {self.order_id}")
            self.log("📊", f"Order status: {order_status}")
            if order_status == "PENDING":
                self.log("✨", "Order status is PENDING (no paymentId)")
            else:
                self.log("⚠️", f"Expected status PENDING but got {order_status}")
        
        # Test 12: POST /orders with paymentId (should be PAID)
        success, response = self.test(
            "POST /orders with paymentId returns status PAID",
            "POST", "/orders", 200,
            data={
                "customerName": "Paid Customer",
                "customerPhone": "9876543211",
                "grandTotal": 300.0,
                "paymentId": "pay_test123",
                "paymentMethod": "RAZORPAY",
                "items": [
                    {"name": "Butter Chicken", "price": 349.0, "quantity": 1}
                ]
            }
        )
        
        if success:
            paid_status = response.get("status")
            if paid_status == "PAID":
                self.log("✨", "Order with paymentId has status PAID")
            else:
                self.log("⚠️", f"Expected status PAID but got {paid_status}")
        
        # Test 13: GET /orders/{id} (public - get specific order)
        if self.order_id:
            success, response = self.test(
                "GET /orders/{id} returns specific order",
                "GET", f"/orders/{self.order_id}", 200
            )
            
            if success:
                if response.get("id") == self.order_id:
                    self.log("✨", "Order retrieved successfully")
                else:
                    self.log("⚠️", "Retrieved order ID doesn't match")
        
        # Test 14: GET /orders without auth (should fail)
        self.test(
            "GET /orders without auth (should return 401)",
            "GET", "/orders", 401
        )
        
        # Test 15: GET /orders with auth (admin - get all orders)
        if self.token:
            success, response = self.test(
                "GET /orders with auth returns all orders",
                "GET", "/orders", 200,
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success and isinstance(response, list):
                order_count = len(response)
                self.log("📊", f"Found {order_count} orders")
        
        # Test 16: PATCH /orders/{id}/status without auth (should fail)
        if self.order_id:
            self.test(
                "PATCH /orders/{id}/status without auth (should return 401)",
                "PATCH", f"/orders/{self.order_id}/status", 401,
                data={"status": "PREPARING"}
            )
        
        # Test 17: PATCH /orders/{id}/status with auth (update status)
        if self.token and self.order_id:
            success, response = self.test(
                "PATCH /orders/{id}/status with auth updates status",
                "PATCH", f"/orders/{self.order_id}/status", 200,
                data={"status": "PREPARING"},
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success:
                new_status = response.get("status")
                if new_status == "PREPARING":
                    self.log("✨", "Order status updated to PREPARING")
                else:
                    self.log("⚠️", f"Expected status PREPARING but got {new_status}")
        
        # ===== TABLE TESTS =====
        print("\n" + "=" * 80)
        self.log("🪑", "TESTING TABLE ENDPOINTS")
        print("=" * 80)
        
        # Test 18: GET /tables without auth (should fail)
        self.test(
            "GET /tables without auth (should return 401)",
            "GET", "/tables", 401
        )
        
        # Test 19: POST /tables without auth (should fail)
        self.test(
            "POST /tables without auth (should return 401)",
            "POST", "/tables", 401,
            data={
                "tableNumber": "T99",
                "label": "Test Table"
            }
        )
        
        # Test 20: POST /tables with auth (create table)
        if self.token:
            test_table_num = f"TEST-{datetime.now().strftime('%H%M%S')}"
            success, response = self.test(
                "POST /tables with auth creates table",
                "POST", "/tables", 200,
                data={
                    "tableNumber": test_table_num,
                    "label": "Test Table",
                    "qrUrl": f"https://example.com/?table={test_table_num}",
                    "isActive": True
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success and "id" in response:
                self.table_id = response["id"]
                self.log("🆔", f"Created table with ID: {self.table_id}")
        
        # Test 21: GET /tables with auth (get all tables)
        if self.token:
            success, response = self.test(
                "GET /tables with auth returns tables",
                "GET", "/tables", 200,
                headers={"Authorization": f"Bearer {self.token}"}
            )
            
            if success and isinstance(response, list):
                table_count = len(response)
                self.log("📊", f"Found {table_count} tables")
        
        # Test 22: POST /tables with duplicate tableNumber (should fail)
        if self.token and self.table_id:
            # Try to get the table number from the created table
            success, tables = self.test(
                "POST /tables with duplicate tableNumber (should return 400)",
                "POST", "/tables", 400,
                data={
                    "tableNumber": test_table_num,  # Same as above
                    "label": "Duplicate Table"
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )
        
        # ===== CLEANUP =====
        print("\n" + "=" * 80)
        self.log("🧹", "CLEANUP - Deleting test data")
        print("=" * 80)
        
        # Delete test menu item
        if self.token and self.menu_item_id:
            success, _ = self.test(
                "DELETE /menu/{id} with auth",
                "DELETE", f"/menu/{self.menu_item_id}", 200,
                headers={"Authorization": f"Bearer {self.token}"}
            )
        
        # Delete test table
        if self.token and self.table_id:
            success, _ = self.test(
                "DELETE /tables/{id} with auth",
                "DELETE", f"/tables/{self.table_id}", 200,
                headers={"Authorization": f"Bearer {self.token}"}
            )
        
        # ===== SUMMARY =====
        print("\n" + "=" * 80)
        self.log("📊", "TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failures:
            print("\n" + "=" * 80)
            self.log("❌", "FAILED TESTS DETAILS")
            print("=" * 80)
            for i, failure in enumerate(self.failures, 1):
                print(f"\n{i}. {failure.get('test', 'Unknown')}")
                print(f"   Endpoint: {failure.get('endpoint', 'N/A')}")
                if 'expected' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"   Error: {failure['error']}")
        
        print("\n" + "=" * 80)
        return 0 if self.tests_failed == 0 else 1

def main():
    tester = APITester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
