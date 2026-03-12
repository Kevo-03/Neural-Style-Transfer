import pytest
from sqlmodel import select
from unittest.mock import patch, AsyncMock
from app.models import User, Image

# --- 1. SIGNUP TESTS ---

def test_signup_success(client):
    response = client.post(
        "/auth/signup", 
        json={"email": "kivanc@test.com", "password": "supersecretpassword"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "kivanc@test.com"
    assert "password" not in response.json()

def test_signup_duplicate_email(client):
    client.post("/auth/signup", json={"email": "kivanc@test.com", "password": "pass"})
    response = client.post("/auth/signup", json={"email": "kivanc@test.com", "password": "pass"})
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

# --- 2. LOGIN TESTS ---
def test_login_success_sets_cookie(client):
    client.post("/auth/signup", json={"email": "test@test.com", "password": "pass"})

    response = client.post(
        "/auth/login", 
        data={"username": "test@test.com", "password": "pass"}
    )
    
    assert response.status_code == 200
    
    set_cookie_header = response.headers.get("set-cookie")
    assert "access_token=" in set_cookie_header
    assert "HttpOnly" in set_cookie_header

def test_login_wrong_password(client):
    client.post("/auth/signup", json={"email": "test@test.com", "password": "pass"})
    
    response = client.post(
        "/auth/login", 
        data={"username": "test@test.com", "password": "WRONG_PASSWORD"}
    )
    assert response.status_code == 401

def test_get_me_authenticated(client):
    # 1. Signup and Login
    client.post("/auth/signup", json={"email": "auth@test.com", "password": "pass"})
    login_response = client.post("/auth/login", data={"username": "auth@test.com", "password": "pass"})
    
    cookie_header = login_response.headers.get("set-cookie")
    token = cookie_header.split("access_token=")[1].split(";")[0]

    client.cookies.set("access_token", token)
    response = client.get("/auth/me")
    
    assert response.status_code == 200
    assert response.json()["email"] == "auth@test.com"

# --- 4. ACCOUNT DELETION TEST ---
@patch("app.routers.auth.delete_from_spaces", new_callable=AsyncMock)
def test_delete_user_account(mock_delete, client, session):
    client.post("/auth/signup", json={"email": "delete@test.com", "password": "pass"})
    login_res = client.post("/auth/login", data={"username": "delete@test.com", "password": "pass"})
    
    token = login_res.headers.get("set-cookie").split("access_token=")[1].split(";")[0]
    client.cookies.set("access_token", token)

    response = client.delete("/auth/account")

    assert response.status_code == 200
    assert response.json()["message"] == "Account and all associated cloud data successfully deleted."

    user_in_db = session.exec(select(User).where(User.email == "has_images@test.com")).first()
    assert user_in_db is None
    
    set_cookie = response.headers.get("set-cookie")
    assert "access_token=" in set_cookie
    assert "Max-Age=0" in set_cookie or "expires=" in set_cookie.lower()

@patch("app.routers.auth.delete_from_spaces", new_callable=AsyncMock)
def test_delete_user_account_with_images(mock_delete, client, session):
    client.post("/auth/signup", json={"email": "has_images@test.com", "password": "pass"})
    login_res = client.post("/auth/login", data={"username": "has_images@test.com", "password": "pass"})
    
    token = login_res.headers.get("set-cookie").split("access_token=")[1].split(";")[0]
    client.cookies.set("access_token", token)

    user = session.exec(select(User).where(User.email == "has_images@test.com")).first()
    
    fake_image = Image(
        user_id=user.id,
        content_path="fake_bucket/content_123.jpg",
        style_path="fake_bucket/style_123.jpg",
        result_path="fake_bucket/result_123.jpg"
    )
    session.add(fake_image)
    session.commit()

    response = client.delete("/auth/account")
    assert response.status_code == 200

    user_in_db = session.exec(select(User).where(User.email == "has_images@test.com")).first()
    assert user_in_db is None
    
    image_in_db = session.exec(select(Image).where(Image.user_id == user.id)).first()
    assert image_in_db is None

    assert mock_delete.call_count == 3
    
    mock_delete.assert_any_call("fake_bucket/content_123.jpg")
    mock_delete.assert_any_call("fake_bucket/style_123.jpg")
    mock_delete.assert_any_call("fake_bucket/result_123.jpg")
