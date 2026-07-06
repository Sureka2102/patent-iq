import pytest


@pytest.mark.asyncio
async def test_register(client):
    res = await client.post("/api/auth/register", json={"name": "Alice", "email": "alice@test.com", "password": "secret123"})
    assert res.status_code == 201
    assert res.json()["email"] == "alice@test.com"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    payload = {"name": "Alice", "email": "alice@test.com", "password": "secret123"}
    await client.post("/api/auth/register", json=payload)
    res = await client.post("/api/auth/register", json=payload)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/auth/register", json={"name": "Bob", "email": "bob@test.com", "password": "pass123"})
    res = await client.post("/api/auth/login", json={"email": "bob@test.com", "password": "pass123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid(client):
    res = await client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "wrong"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_profile(client):
    await client.post("/api/auth/register", json={"name": "Carol", "email": "carol@test.com", "password": "pass123"})
    login = await client.post("/api/auth/login", json={"email": "carol@test.com", "password": "pass123"})
    token = login.json()["access_token"]
    res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "carol@test.com"
