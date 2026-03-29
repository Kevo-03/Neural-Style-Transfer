"""
One-time migration: add 'username' column, backfill from email, drop 'email'.

Run inside the backend container:
    docker exec -it <backend_container> python migrate_add_username.py

Safe to delete after successful execution.
"""

import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)


def migrate():
    with engine.begin() as conn:
        # 1. Add username column with a temporary default
        conn.execute(text(
            "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS username VARCHAR"
        ))

        # 2. Backfill username from email prefix (part before @)
        conn.execute(text(
            "UPDATE \"user\" SET username = split_part(email, '@', 1) WHERE username IS NULL"
        ))

        # 3. Handle duplicate usernames by appending _2, _3, etc.
        dupes = conn.execute(text("""
            SELECT username, array_agg(id ORDER BY id) AS ids
            FROM "user"
            GROUP BY username
            HAVING count(*) > 1
        """)).fetchall()

        for row in dupes:
            username, ids = row
            # Keep the first user's username as-is, rename the rest
            for i, user_id in enumerate(ids[1:], start=2):
                new_username = f"{username}_{i}"
                conn.execute(text(
                    'UPDATE "user" SET username = :new WHERE id = :uid'
                ), {"new": new_username, "uid": user_id})

        # 4. Set NOT NULL and UNIQUE constraints
        conn.execute(text(
            'ALTER TABLE "user" ALTER COLUMN username SET NOT NULL'
        ))

        # Check if unique index already exists before creating
        idx_exists = conn.execute(text("""
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'user' AND indexname = 'ix_user_username'
        """)).fetchone()

        if not idx_exists:
            conn.execute(text(
                'CREATE UNIQUE INDEX ix_user_username ON "user" (username)'
            ))

        # 5. Drop the email column
        conn.execute(text(
            'ALTER TABLE "user" DROP COLUMN IF EXISTS email'
        ))

    print("Migration complete!")
    print("- Added 'username' column (backfilled from email prefix)")
    print("- Dropped 'email' column")

    # Show the resulting usernames
    with engine.connect() as conn:
        rows = conn.execute(text('SELECT id, username FROM "user" ORDER BY id')).fetchall()
        print(f"\n{len(rows)} user(s) migrated:")
        for row in rows:
            print(f"  id={row[0]}  username={row[1]}")


if __name__ == "__main__":
    migrate()
