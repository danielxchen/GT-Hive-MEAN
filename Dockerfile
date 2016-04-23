FROM justbuchanan/docker-archlinux

RUN pacman -Sy --noconfirm nodejs npm git
RUN npm install -g -y nodemon bower gulp

RUN mkdir gthive
WORKDIR gthive
COPY app public *.js *.json node_modules .bowerrc ./

RUN npm install
RUN bower install --allow-root

EXPOSE 8080
COPY run.sh ./
RUN pacman -S --noconfirm openconnect
CMD ./run.sh
