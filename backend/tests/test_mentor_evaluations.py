import os
import sys
from pathlib import Path
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "mentor-test-key-not-for-deployment"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base, get_db
from main import app
from models.user import User
from models.intern_profile import InternProfile
from models.mentor_evaluation import MentorAssignment, MentorEvaluation
from services.auth_service import create_access_token


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine)
    with sessions() as db:
        for id, role in [(1,"mentor"),(2,"mentor"),(3,"hr"),(4,"intern"),(5,"intern"),(6,"admin"),(7,"mentor")]:
            db.add(User(id=id, username=f"user{id}", email=f"u{id}@example.com", full_name=f"User {id}", password_hash="test-only", role=role, is_active=id!=7))
        db.add_all([InternProfile(id=1, user_id=4, full_name="Intern A", status="approved"), InternProfile(id=2, user_id=5, full_name="Intern B", status="approved")])
        db.flush()
        db.add_all([MentorAssignment(intern_id=1,mentor_id=1),MentorAssignment(intern_id=2,mentor_id=2)])
        db.commit()
    def override_db():
        with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c, sessions
    app.dependency_overrides.clear()
    engine.dispose()


def headers(id=1, role="mentor"):
    return {"Authorization":f"Bearer {create_access_token(id,role)}"}


def payload(**changes):
    return {"technical":5,"problem_solving":4,"learning":4,"discipline":5,"initiative":4,"teamwork":5,"strengths":"Tiếp thu nhanh", "improvements":"Cải thiện kiểm thử", "conclusion":"Hoàn thành tốt thực tập", "status":"submitted","expected_revision":0,**changes}


def test_assigned_list_is_scoped(client):
    c,_=client
    assert [i["id"] for i in c.get('/api/mentor/interns',headers=headers()).json()]==[1]
    assert [i["id"] for i in c.get('/api/mentor/interns',headers=headers(2)).json()]==[2]


def test_auth_and_roles(client):
    c,_=client
    assert c.get('/api/mentor/interns').status_code in (401,403)
    assert c.get('/api/mentor/interns',headers=headers(3,"hr")).status_code==403
    assert c.get('/api/mentor/interns',headers=headers(7)).status_code==403


def test_unassigned_intern_cannot_be_read_or_written(client):
    c,_=client
    assert c.get('/api/mentor/evaluations/2',headers=headers()).status_code==403
    assert c.put('/api/mentor/evaluations/2',headers=headers(),json=payload()).status_code==403


def test_intern_cannot_submit(client):
    c,_=client
    assert c.put('/api/mentor/evaluations/1',headers=headers(4,"intern"),json=payload()).status_code==403


def test_draft_persists_and_updates(client):
    c,sessions=client
    r=c.put('/api/mentor/evaluations/1',headers=headers(),json={"strengths":"  Tiến bộ  "})
    assert r.status_code==200
    assert r.json()["strengths"]=="Tiến bộ"
    assert r.json()["overall_score"] is None
    assert r.json()["revision"]==1
    r=c.put('/api/mentor/evaluations/1',headers=headers(),json={"technical":3,"expected_revision":1})
    assert r.status_code==200 and r.json()["revision"]==2
    with sessions() as db:
        assert db.query(MentorEvaluation).count()==1
        assert db.query(MentorEvaluation).first().technical==3
    assert c.get('/api/mentor/evaluations/1',headers=headers()).json()["technical"]==3


def test_revision_conflict_preserves_data(client):
    c,_=client
    c.put('/api/mentor/evaluations/1',headers=headers(),json={"technical":3})
    r=c.put('/api/mentor/evaluations/1',headers=headers(),json={"technical":5,"expected_revision":0})
    assert r.status_code==409
    assert c.get('/api/mentor/evaluations/1',headers=headers()).json()["technical"]==3


@pytest.mark.parametrize("changes",[{"technical":0},{"technical":6},{"technical":True},{"technical":"4"},{"technical":3.5},{"technical":None},{"conclusion":"  "},{"strengths":"x"*2001}])
def test_invalid_submission(client,changes):
    c,_=client
    assert c.put('/api/mentor/evaluations/1',headers=headers(),json=payload(**changes)).status_code==422


def test_final_scores_and_lock(client):
    c,_=client
    r=c.put('/api/mentor/evaluations/1',headers=headers(),json=payload())
    assert r.status_code==200
    data=r.json()
    assert data["skill_score"]==4.33 and data["attitude_score"]==4.67
    assert data["overall_score"]==4.5 and data["rating"]=="Xuất sắc"
    assert data["submitted_at"] and data["status"]=="submitted"
    assert c.put('/api/mentor/evaluations/1',headers=headers(),json=payload(expected_revision=1,technical=1)).status_code==409
    assert c.get('/api/mentor/evaluations/1',headers=headers()).json()["technical"]==5


def test_assignment_requires_hr_and_active_mentor(client):
    c,_=client
    assert c.put('/api/mentor/assignments/1',headers=headers(),json={"mentor_id":2}).status_code==403
    assert c.put('/api/mentor/assignments/1',headers=headers(3,"hr"),json={"mentor_id":7}).status_code==400
    assert c.put('/api/mentor/assignments/1',headers=headers(3,"hr"),json={"mentor_id":4}).status_code==400


def test_reassignment_removes_old_access_and_keeps_history(client):
    c,sessions=client
    assert c.put('/api/mentor/evaluations/1',headers=headers(),json=payload()).status_code==200
    assert c.put('/api/mentor/assignments/1',headers=headers(3,"hr"),json={"mentor_id":2}).status_code==200
    assert c.get('/api/mentor/evaluations/1',headers=headers()).status_code==403
    assert c.put('/api/mentor/evaluations/1',headers=headers(),json=payload()).status_code==403
    assert c.get('/api/mentor/evaluations/1',headers=headers(2)).json() is None
    assert c.put('/api/mentor/evaluations/1',headers=headers(2),json=payload()).status_code==200
    with sessions() as db:
        assert db.query(MentorEvaluation).filter_by(intern_id=1).count()==2
