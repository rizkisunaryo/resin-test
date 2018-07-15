# How to Run?
Make sure Docker is installed.
## Just Run
1. Run the backend:
```sh
docker run -p 3010:3010 --label=resin-test rizkisunaryo/resin-ws
```
2. Run the drone simulator:
```sh
docker run --net=host --label=resin-test rizkisunaryo/resin-drones
```
3. Run the dashboard:
```sh
docker run -p 3000:3000 --label=resin-test rizkisunaryo/resin-dashboard
```
4. Open http://localhost:3000 in your browser. You can see that the drones are moving.
## Or Build First
1. Clone or download Docker files from [here].
2. `cd` to `resin-docker` folder.
3. Build backend image:
```sh
docker build -t resin-ws -f dockerfile-ws .
```
4. Build dashboard image:
```sh
docker build -t resin-dashboard -f dockerfile-dashboard .
```
5. Build drone simulator image:
```sh
docker build -t resin-drones -f dockerfile-drones .
```
6. Run the backend:
```sh
docker run -p 3010:3010 --label=resin-test resin-ws
```
7. Run the drone simulator:
```sh
docker run --net=host --label=resin-test resin-drones
```
8. Run the dashboard:
```sh
docker run -p 3000:3000 --label=resin-test resin-dashboard
```
9. Open http://localhost:3000 in your browser. You can see that the drones are moving.

# How to Stop?
```sh
docker rm -f $(docker ps -aqf "label=resin-test")
```

# Technologies
  - [Socket.io] for websocket server and client
  - [Mocha] for backend unit testing
  - [React] to create dashboard
  - [Repatch] as state management for React
  - [Docker] as a container, to simply run the system easily

# Completeness
## Technical
  - Backend unit testing
  - Frontend unit testing for functions
  - Dashboard
  - Docker to simply and run the system easily
## Product
  - Drone speed
  - Detect when a drone is not moving for 10 seconds
  - Drone simulator (`resin-ws-drone/executables/drone-simulator.js`)

# Cellular Connections are Expensive
  - The drone is only asked to send token only once during the handshake.
  - Lat and long are sent just in numbers.

# Assumptions
  - Drones start flying from 0 coordinate.

# Room for Improvement
## Technical
  - In `ws.js`, the event names are messy. It should be in this rule: `from-to-event`, so it's going to be easy to distinguish.
  - The WS server only uses 1 replica. Since this is a websocket, so I'm not sure whether the handshake will be managed automatically properly if there are more than 1 replica. Stress test is needed to make sure about this.
## Product
  - Dashboard should use Google Maps
  - Dashboard can zoom in and zoom out automatically, based on drone positions
  - Color of drones in dashboard should vary
  - If users and credentiols are added to the dashboard, this system can become SaaS

   [socket.io]: <https://socket.io/>
   [mocha]: <https://mochajs.org/>
   [react]: <https://reactjs.org/>
   [repatch]: <https://github.com/jaystack/repatch>
   [here]: <https://github.com/rizkisunaryo/resin-docker>
   [docker]: <https://www.docker.com/>
