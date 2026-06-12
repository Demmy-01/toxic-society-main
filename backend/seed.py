"""
Database seed script to populate the local MySQL database with default data.
Creates an admin user, default drops, and default products matching the frontend expected list.
"""

from app.database import SessionLocal, engine, Base
from app.models import User, CustomerProfile, Drop, Product, DropStatus
from app.utils.security import hash_password
from datetime import datetime, timedelta
import json
import uuid

def seed_database():
    db = SessionLocal()
    try:
        # 1. Create default admin user if not exists
        admin_email = "admin@toxicsociety.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            print("Creating default admin user...")
            admin_user = User(
                email=admin_email,
                password_hash=hash_password("adminpassword123"),
                full_name="Admin User",
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Create admin customer profile
            admin_profile = CustomerProfile(
                user_id=admin_user.id,
                name="Admin User",
                email=admin_email
            )
            db.add(admin_profile)
            db.commit()
            print(f"Admin user created (email: {admin_email}, password: adminpassword123)")
        else:
            print("Admin user already exists.")

        # 2. Create default drops if not exist
        drops_data = [
            {"name": "Drop 01", "label": "Core Release", "status": DropStatus.PAST, "days_offset": -30},
            {"name": "Drop 02", "label": "Winter Collection", "status": DropStatus.PAST, "days_offset": -15},
            {"name": "Drop 03", "label": "Spring Summer 2025", "status": DropStatus.LIVE, "days_offset": 0},
        ]
        
        drops_map = {}
        for d_info in drops_data:
            drop = db.query(Drop).filter(Drop.name == d_info["name"]).first()
            if not drop:
                print(f"Creating drop: {d_info['name']}...")
                drop = Drop(
                    name=d_info["name"],
                    label=d_info["label"],
                    status=d_info["status"],
                    drop_date=datetime.utcnow() + timedelta(days=d_info["days_offset"]),
                    duration_hours=72,
                    is_active=True,
                    is_featured=(d_info["status"] == DropStatus.LIVE)
                )
                db.add(drop)
                db.commit()
                db.refresh(drop)
            drops_map[d_info["name"]] = drop.id

        # 3. Create default products if not exist
        products_data = [
            {
                "id": "static-1",
                "name": "Toxic Flame Polo Sweatshirt",
                "price": 189.0,
                "original_price": 230.0,
                "category": "Tops",
                "collection": "SS25",
                "drop_name": "Drop 03",
                "description": "The signature Toxic Society polo sweatshirt. Deep crimson with rhinestone flame detailing on the sleeves, white contrast collar and cuffs, and the iconic Toxic Society emblem embroidered on the chest. Limited edition drop.",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "colors": ["Red", "Beige"],
                "tag": "NEW DROP",
                "in_stock": True,
            },
            {
                "id": "static-2",
                "name": "TS Logo Leather Belt",
                "price": 129.0,
                "original_price": None,
                "category": "Accessories",
                "collection": "Core",
                "drop_name": "Drop 01",
                "description": "Premium red leather belt with the iconic Toxic Society barbed wire logo in silver metal hardware. A statement accessory for those who live on the edge. One size fits most.",
                "sizes": ["ONE SIZE"],
                "colors": ["Red"],
                "tag": "BESTSELLER",
                "in_stock": True,
            },
            {
                "id": "static-3",
                "name": "Toxic Society Barbed Tee",
                "price": 89.0,
                "original_price": None,
                "category": "Tops",
                "collection": "Core",
                "drop_name": "Drop 01",
                "description": "Clean white heavyweight tee with the Toxic Society barbed wire logo screened across the chest in blood red. Simple. Dangerous. Unforgettable.",
                "sizes": ["XS", "S", "M", "L", "XL"],
                "colors": [],
                "tag": None,
                "in_stock": True,
            },
            {
                "id": "static-4",
                "name": "TS Flame Cargo Pants",
                "price": 159.0,
                "original_price": None,
                "category": "Bottoms",
                "collection": "SS25",
                "drop_name": "Drop 02",
                "description": "Crimson cargo pants with subtle flame embroidery along the side seams. Four functional cargo pockets with branded metal zippers. A perfect companion to the Flame Polo Sweatshirt.",
                "sizes": ["28", "30", "32", "34", "36"],
                "colors": [],
                "tag": None,
                "in_stock": True,
            },
            {
                "id": "static-5",
                "name": "Toxic Society Cap",
                "price": 59.0,
                "original_price": 79.0,
                "category": "Accessories",
                "collection": "FW24",
                "drop_name": "Drop 02",
                "description": "Six-panel structured cap in deep red with embroidered TS logo on the front panel. Adjustable strap with metal clasp. Part of the SS25 collection.",
                "sizes": ["ONE SIZE"],
                "colors": ["Red", "Blue", "Indigo"],
                "tag": "SALE",
                "in_stock": True,
            },
            {
                "id": "static-6",
                "name": "Toxic Zip-Up Hoodie",
                "price": 219.0,
                "original_price": None,
                "category": "Tops",
                "collection": "FW24",
                "drop_name": "Drop 02",
                "description": "Heavyweight zip-up hoodie in off-white with red Toxic Society screenprint and barbed wire graphic sleeve prints. Oversized fit with dropped shoulders.",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "colors": [],
                "tag": None,
                "in_stock": True,
            },
        ]
        
        # Mapping frontend asset paths or simple placeholders
        # Since frontend expects local image files, we can just supply placeholder strings or leave empty
        # and frontend fallback to default assets. In this case, frontend imports local assets in data/products.ts.
        # But for new items loaded from API, we can point to local static paths.
        for p_info in products_data:
            prod = db.query(Product).filter(Product.id == p_info["id"]).first()
            if not prod:
                print(f"Creating product: {p_info['name']}...")
                prod = Product(
                    id=p_info["id"],
                    name=p_info["name"],
                    description=p_info["description"],
                    price=p_info["price"],
                    original_price=p_info["original_price"],
                    category=p_info["category"],
                    collection=p_info["collection"],
                    drop_id=drops_map.get(p_info["drop_name"]),
                    tag=p_info["tag"],
                    sizes=p_info["sizes"],
                    colors=p_info["colors"],
                    in_stock=p_info["in_stock"],
                    is_active=True,
                    images=[], # Leave empty, frontend has static fallbacks
                    stock_quantity=100
                )
                db.add(prod)
                db.commit()
                print(f"Product {p_info['name']} created.")
            else:
                # Update drop_id just in case
                prod.drop_id = drops_map.get(p_info["drop_name"])
                db.commit()

        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
