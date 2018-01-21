FROM node:9.4.0

RUN git clone https://github.com/johannwagner/studyVoteReact.git

WORKDIR studyVoteReact

RUN npm install
RUN npm install -g serve

RUN npm run build

CMD ["serve", "-p", "3000", "build"]
