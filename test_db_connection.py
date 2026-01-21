import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

passwords = ["admin", "postgres", "password", "1234", "root"]
default_url = "postgresql://postgres:{password}@localhost:5432/genetic_db"

print("Testing database connections...")

success = False
for pwd in passwords:
    url = default_url.format(password=pwd)
    print(f"Trying password: '{pwd}' ...")
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            print(f"SUCCESS! Connected with password: '{pwd}'")
            success = True
            break
    except OperationalError as e:
        if "password authentication failed" in str(e):
            print(f"Failed: Password '{pwd}' is incorrect.")
        else:
            print(f"Failed with other error: {e}")

if not success:
    print("\nCould not connect with common passwords.")
    with open("db_password_found.txt", "w") as f:
        f.write("FAILED")
else:
    print("\nPlease update your .env file with the working password.")
    # The 'pwd' variable still holds the last checked password, which is the successful one if loop broke
    with open("db_password_found.txt", "w") as f:
        f.write(pwd)
