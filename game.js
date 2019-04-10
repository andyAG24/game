'use strict';

class Vector {
    constructor(x, y) {
        x != undefined ? this.x = x: this.x = 0;
        y != undefined ? this.y = y: this.y = 0;
    };
    
    plus(object) {
        if (object instanceof Vector) {
            let newX = object.x + this.x; 
            let newY = object.y + this.y;
            return new object.constructor(newX, newY);
        } else {
            throw Error();
        }
    }

    times(number) {
        let newX = this.x * number; 
        let newY = this.y * number;
        return new Vector(newX, newY);
    }
}

class Actor {
    constructor(pos, size, speed) {

        // pos
        if (pos !== undefined) {
            if ((pos instanceof Vector) !== true) {
                throw Error();
            } else { this.pos = pos; }
        } else {
            this.pos = new Vector(0, 0);
        }

        // size
        if (size !== undefined) {
            if ((size instanceof Vector) !== true) {
                throw Error();
            } else { this.size = size; }
        } else {
            this.size = new Vector(1, 1);
        }

        // speed
        if (speed !== undefined) {
            if ((speed instanceof Vector) !== true) {
                throw Error();
            } else { this.speed = new speed.constructor(); }
        } else {
            this.speed = new Vector(0, 0);
        }

        this.left = this.pos.x;
        this.right = this.left + this.size.x;
        this.top = this.pos.y;
        this.bottom = this.top + this.size.y;
    }

    get type() {
		return 'actor';
	}

    act() {}

    isIntersect(actor) {

        // Проверка является ли переданный объект экземпляром класса Actor
        if (((actor instanceof Actor) !== true) || (actor === undefined)) { throw Error(); }

        // Проверка на пересечение с самим собой
		if (actor === this) {
			return false;
		}

        return (
			this.left < actor.right &&
			this.right > actor.left &&
			this.bottom > actor.top &&
			this.top < actor.bottom
		);
    }  
}

class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.player = this.actors.find(actor => actor.type === 'player');
        this.height = this.grid.length;
        this.width = this.grid.reduce((a, b) => {
			return b.length > a ? b.length : a;
		}, 0);
		this.status = null;
		this.finishDelay = 1;
    }

    isFinished() {
        if ((this.status !== null) && (this.finishDelay < 0)) {
            return true;
        } else {
            return false;
        } 
    }

    actorAt(actor) {
        if (!(actor instanceof Actor) || !actor){ 
            throw new Error(); 
        } 

        if (!this.actors) {
            return undefined;
        } else {
            return this.actors.find(currentActor => currentActor.isIntersect(actor));
        }
    }

    obstacleAt(pos, size) {
        if (!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw new Error();
        }
        
        const leftBorder = Math.floor(pos.x);
        const rightBorder = Math.ceil(pos.x + size.x);
        const topBorder = Math.floor(pos.y);
        const bottomBorder = Math.ceil(pos.y + size.y);

        if ((leftBorder < 0) || (rightBorder > this.width) || (topBorder < 0)) {
            return 'wall';
        }
        if (bottomBorder > this.height) {
            return 'lava';
        }

        for (let i = topBorder; i < bottomBorder; i++) {
            for (let j = leftBorder; j < rightBorder; j++) {
                if (this.grid[i][j]) {
                    return this.grid[i][j];
                } else {
                    return undefined;
                }
            }
        }
    }

    removeActor(actor) {
        if (this.actors.includes(actor)) {
            this.actors = this.actors.filter(oneActor => oneActor !== actor);
        }
    }

    noMoreActors(type) {
		if (this.actors) {
			for (let actor of this.actors) {
				if (actor.type === type) {
					return false;
				}
			}
		}
		return true;
    }
    
    playerTouched(type, actor) {
        if (type === 'lava' || type === 'fireball') {
            this.status = 'lost';
        }
        if (type === 'coin') {
            this.removeActor(actor);
            if (this.noMoreActors('coin')) {
                this.status = 'won';
            }
        }
    }
}

class LevelParser {
    constructor(objectsDict) {
        this.objectsDict = objectsDict;
    }

    actorFromSymbol(symbol) {
        if (!symbol) {
            return undefined;
        } else {
            return this.objectsDict[symbol];
        }
    }

    obstacleFromSymbol(symbol) {
        if (!symbol) {
            return undefined;
        }
        if (symbol === 'x') {
            return 'wall';
        } else if (symbol === '!') {
            return 'lava';
        }
    }

    createGrid(plan = []) {
        return plan.map(item => {
            return item.split('').map(i => {
                return this.obstacleFromSymbol(i);
            });
        });
    }

    createActors(plan = []) {
        const actors = [];
        const planArray = plan.map(line => line.split(''));

        planArray.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (this.objectsDict && this.objectsDict[cell] && typeof this.objectsDict[cell] === 'function') {
                    const actor = new this.objectsDict[cell](new Vector(x, y));
                    if (actor instanceof Actor) {
                        actors.push(actor);
                    }
                }
            });
        });

        return actors;
    }

    parse(plan = []) {
        let grid = this.createGrid(plan);
        let actors = this.createActors(plan);
        let level = new Level(grid, actors);
        return level;
    }
}

class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed) {
        super(pos, new Vector(1, 1), speed);
        this.speed = speed;
        if (this.speed === undefined) { this.speed = new Vector(0, 0); }
    }

    get type() {
		return 'fireball';
    }
    
    getNextPosition(time = 1) {
        let newX = this.pos.x + this.speed.x * time;
        let newY = this.pos.y + this.speed.y * time; 
        return new Vector(newX, newY);
    }

    handleObstacle() {
        this.speed = new Vector(-this.speed.x, -this.speed.y); 
    }

    act(time, level) {
        if (level.obstacleAt(this.getNextPosition(time), this.size)) {
          this.handleObstacle();
        } else {
          this.pos = this.getNextPosition(time);
        }
    }

}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos);
        this.size = new Vector(1, 1);
        this.speed = new Vector(2, 0);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos);
        this.size = new Vector(1, 1);
        this.speed = new Vector(0, 2);
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos);
        this.startPos = pos;
        this.size = new Vector(1, 1);
        this.speed = new Vector(0, 3);
    }

    handleObstacle() {
        this.speed = new Vector(this.speed.x, this.speed.y);
        this.pos = this.startPos;
    }
}

class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
        this.spring = Math.round(0 + Math.random() * (2 * Math.PI - 0 + 1))
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.startPos = new Vector(this.pos.x, this.pos.y);
    }

    get type() {
        return "coin";
    }

    updateSpring(time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        let nextPos = this.startPos.plus(this.getSpringVector());
        return nextPos;
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos) {
        super(pos);
        this.pos = new Vector(this.pos.x, this.pos.y - 0.5);
        this.size = new Vector(0.8, 1.5);
    }

    get type() {
        return "player";
    }
}










const schemas = [
    [
      '    v    ',
      '         ',
      '         ',
      '        o',
      '       !x',
      '@        ',
      'xxx      ',
      '         '
    ]
  ];
  const actorDict = {
    '@': Player,
    'v': FireRain,
    '=': HorizontalFireball,
    '|': VerticalFireball,
    'o': Coin
  };
  
  const parser = new LevelParser(actorDict);
  runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли'));