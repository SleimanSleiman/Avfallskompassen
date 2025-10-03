# Avfallskompassen

## Prerequisites

- **Node.js** (v18 or newer recommended): https://nodejs.org/
- **Java JDK 17**: https://adoptium.net/
- **Maven** (for first-time setup, to generate wrapper): https://maven.apache.org/download.cgi

---

## Frontend Setup (React + Vite)

1. Open a terminal and navigate to the `frontend` folder:
	```sh
	cd frontend
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Start the development server:
	```sh
	npm run dev
	```
4. The app will be available at the URL shown in the terminal (usually http://localhost:5173).

---

## Backend Setup (Spring Boot)

1. Make sure you have Java 17 and Maven installed, and that `JAVA_HOME` is set.
2. Open a terminal and navigate to the `backend` folder:
	```sh
	cd backend
	```
3. (First time only) Generate the Maven Wrapper (if not already present):
	```sh
	mvn -N io.takari:maven:wrapper
	```
4. Start the backend server:
	```sh
	.\mvnw.cmd spring-boot:run
	```
	(On Mac/Linux: `./mvnw spring-boot:run`)
5. The backend will be running at http://localhost:8081

---

## Connecting Frontend and Backend

- The frontend is configured to call the backend at `http://localhost:8081`.
- Make sure both servers are running for full functionality.

---

## Troubleshooting

- If you get a `JAVA_HOME not found` error, set the JAVA_HOME environment variable to your JDK 17 installation path.
- If `mvn` is not recognized, add Maven's `bin` directory to your system PATH and restart your terminal/VS Code.