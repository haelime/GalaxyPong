# GalaxyPong 🚀

GalaxyPong은 실시간 3D 탁구 게임과 채팅 기능을 제공하는 웹 서비스입니다. Django와 Vanilla JS, Three.js를 활용하여 몰입감 있는 게임 경험과 소셜 기능을 제공합니다.

[![GalaxyPong Demo](https://img.youtube.com/vi/ukZn_TD_ego/0.jpg)](https://www.youtube.com/watch?v=ukZn_TD_ego)

---

## 🛠 기술 스택

### Backend
- **Framework**: Django, Django Channels
- **Database**: PostgreSQL
- **Cache/Message Broker**: Redis
- **Server**: Daphne (ASGI)

### Frontend
- **Language**: Vanilla JavaScript
- **Graphics**: Three.js (3D Rendering)
- **Web Server**: Nginx

### Infrastructure
- **Container**: Docker, Docker Compose
- **Orchestration**: Makefile for easy management

---

## 🏗 System Architecture

```mermaid
graph TD
    Client((User Browser))
    
    subgraph "Docker Compose Network"
        FE[Nginx (Frontend)]
        BE[Django (Backend)]
        DB[(PostgreSQL)]
        Cache[Redis]
    end

    Client -- "HTTPS / WSS (Port 443)" --> FE
    FE -- "Serve Static Files" --> Client
    FE -- "Proxy API/Socket Requests" --> BE
    
    BE -- "Persist Data" --> DB
    BE -- "Message Broker / Cache" --> Cache
```

## ✨ 주요 기능

- **실시간 게임**: Three.js를 이용한 3D 탁구 경기.
- **채팅 시스템**: 실시간 메시지 송수신 및 채팅방 관리.
- **사용자 관리**: 회원가입, 로그인, 프로필 관리 및 대전 기록 확인.
- **반응형 UI**: 다양한 화면 크기에 최적화된 인터페이스.

---

## 🚀 시작하기

### 사전 준비
- Docker 및 Docker Compose가 설치되어 있어야 합니다.
- `.env` 파일을 루트 디렉토리에 생성해야 합니다. (`.example_env` 참고)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-repo/GalaxyPong.git
   cd GalaxyPong
   ```

2. **환경 변수 설정**
   ```bash
   cp .example_env .env
   # 필요한 환경 변수 수정
   ```

3. **프로젝트 실행**
   ```bash
   make up
   ```
   서비스가 준비되면 `https://localhost`에서 접속할 수 있습니다. (Nginx 설정에 따라 다를 수 있음)

### 관리 명령어 (Makefile)

- `make up`: 컨테이너 빌드 및 백그라운드 실행
- `make down`: 컨테이너 중지
- `make clean`: 컨테이너 및 볼륨 삭제
- `make fclean`: 프로젝트 초기 상태로 완전 초기화 (데이터 삭제 주의)
- `make migrate`: 데이터베이스 마이그레이션 적용

---

## 📁 프로젝트 구조

```text
.
├── backend/          # Django 기반 API 및 소켓 서버
├── frontend/         # Nginx 및 정적 웹 리소스 (HTML/JS)
├── docker-compose.yml
└── makefile
```