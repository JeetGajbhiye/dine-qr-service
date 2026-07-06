package com.restaurant.qrmenu.config;

import com.restaurant.qrmenu.entity.AdminUser;
import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.repository.AdminUserRepository;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminRepo;
    private final MenuItemRepository menuRepo;
    private final PasswordEncoder encoder;

    @Value("${app.admin.username}") private String adminUser;
    @Value("${app.admin.password}") private String adminPass;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedMenu();
    }

    private void seedAdmin() {
        if (adminRepo.findByUsername(adminUser).isEmpty()) {
            AdminUser u = new AdminUser();
            u.setUsername(adminUser);
            u.setPassword(encoder.encode(adminPass));
            u.setRole("ADMIN");
            adminRepo.save(u);
            log.info(">>> Default admin created: {} / {}", adminUser, adminPass);
        }
    }

    private void seedMenu() {
        if (menuRepo.count() > 0) return;

        List<MenuItem> items = List.of(
            item("Paneer Tikka", "पनीर टिक्का", "பன்னீர் டிக்கா",
                "Char-grilled cottage cheese cubes marinated in yogurt & spices.",
                "249.00", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", "Starters", true),
            item("Chicken 65", "चिकन 65", "சிக்கன் 65",
                "Crispy South Indian style spicy fried chicken.",
                "289.00", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", "Starters", false),
            item("Veg Spring Rolls", "वेज स्प्रिंग रोल", "காய்கறி ஸ்பிரிங் ரோல்",
                "Crispy rolls stuffed with fresh vegetables served with sweet chilli sauce.",
                "199.00", "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", "Starters", true),
            item("Butter Chicken", "बटर चिकन", "பட்டர் சிக்கன்",
                "Creamy tomato gravy with tender chicken pieces.",
                "349.00", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800", "Main Course", false),
            item("Paneer Butter Masala", "पनीर बटर मसाला", "பன்னீர் பட்டர் மசாலா",
                "Rich, buttery paneer curry with a touch of cream.",
                "299.00", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800", "Main Course", true),
            item("Veg Biryani", "वेज बिरयानी", "காய்கறி பிரியாணி",
                "Aromatic basmati rice cooked with vegetables and spices.",
                "229.00", "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800", "Main Course", true),
            item("Chicken Biryani", "चिकन बिरयानी", "சிக்கன் பிரியாணி",
                "Hyderabadi style dum-cooked chicken biryani.",
                "329.00", "https://images.unsplash.com/photo-1633945274309-2c16c976d5cc?w=800", "Main Course", false),
            item("Dal Makhani", "दाल मखनी", "தால் மகனி",
                "Slow-cooked black lentils in creamy tomato gravy.",
                "249.00", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800", "Main Course", true),
            item("Masala Chai", "मसाला चाय", "மசாலா டீ",
                "Indian spiced milk tea.",
                "49.00", "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800", "Beverages", true),
            item("Fresh Lime Soda", "ताज़ा नींबू सोडा", "புதிய எலுமிச்சை சோடா",
                "Refreshing lime with sparkling soda.",
                "69.00", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800", "Beverages", true),
            item("Mango Lassi", "आम लस्सी", "மாம்பழ லஸ்ஸி",
                "Thick, creamy yogurt drink with sweet mango.",
                "99.00", "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800", "Beverages", true),
            item("Gulab Jamun", "गुलाब जामुन", "குலாப் ஜாமூன்",
                "Warm milk-solid dumplings soaked in cardamom syrup.",
                "99.00", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800", "Desserts", true),
            item("Rasmalai", "रसमलाई", "ரஸ்மலாய்",
                "Soft cottage cheese patties in saffron milk.",
                "119.00", "https://images.unsplash.com/photo-1594149929911-78975a43d4f5?w=800", "Desserts", true)
        );
        menuRepo.saveAll(items);
        log.info(">>> Seeded {} menu items.", items.size());
    }

    private MenuItem item(String name, String nameHi, String nameTa, String desc,
                          String price, String img, String cat, boolean veg) {
        MenuItem m = new MenuItem();
        m.setName(name);
        m.setNameHi(nameHi);
        m.setNameTa(nameTa);
        m.setDescription(desc);
        m.setDescriptionHi(desc);
        m.setDescriptionTa(desc);
        m.setPrice(new BigDecimal(price));
        m.setImageUrl(img);
        m.setCategory(cat);
        m.setIsAvailable(true);
        m.setIsVeg(veg);
        return m;
    }
}
