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


@pytest.mark.asyncio
async def test_refresh_rotates_tokens(client):
    await client.post("/api/auth/register", json={"name": "Dana", "email": "dana@test.com", "password": "pass123"})
    login = await client.post("/api/auth/login", json={"email": "dana@test.com", "password": "pass123"})

    refreshed = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": login.json()["refresh_token"]},
    )

    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    assert refreshed.json()["refresh_token"]


@pytest.mark.asyncio
async def test_access_token_cannot_be_used_as_refresh_token(client):
    await client.post("/api/auth/register", json={"name": "Eli", "email": "eli@test.com", "password": "pass123"})
    login = await client.post("/api/auth/login", json={"email": "eli@test.com", "password": "pass123"})

    refreshed = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": login.json()["access_token"]},
    )

    assert refreshed.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_cannot_access_profile(client):
    await client.post("/api/auth/register", json={"name": "Fran", "email": "fran@test.com", "password": "pass123"})
    login = await client.post("/api/auth/login", json={"email": "fran@test.com", "password": "pass123"})

    profile = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login.json()['refresh_token']}"},
    )

    assert profile.status_code == 401
