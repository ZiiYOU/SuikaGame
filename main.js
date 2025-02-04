import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const runner = Runner.create();
const render = Render.create({
  engine: engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 600,
    height: 730,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 350, 30, 740, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const rightWall = Bodies.rectangle(585, 350, 30, 740, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const ground = Bodies.rectangle(310, 720, 630, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const topLine = Bodies.rectangle(310, 130, 740, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "E6B143" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(runner, engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let isOver = false;
let interval = null;

function addFruit() {
  if (!isOver) {
    const index = Math.floor(Math.random() * 7);
    const fruit = FRUITS[index];

    const body = Bodies.circle(300, 50, fruit.radius, {
      index,
      isSleeping: true,
      render: {
        sprite: { texture: `${fruit.name}.png` },
      },
      restitution: 0.2,
    });

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body);
  }
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }
  switch (event.keyCode) {
    case 39:
      if (interval) return;
      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 570) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
      break;
    case 37:
      if (interval) return;
      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 35) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
      break;
    case 40:
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 500);
      break;
  }
};

window.onkeyup = (event) => {
  switch (event.keyCode) {
    case 39:
    case 37:
      clearInterval(interval);
      interval = null;
  }
};

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);

      if (newBody.index === FRUITS.length - 1) {
        isOver = true;
        setTimeout(() => {
          alert("Win !");
        }, 1000);
      }
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")
    ) {
      alert("Game over");
      isOver = true;
    }
  });
});

addFruit();
