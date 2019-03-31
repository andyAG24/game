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

        Object.defineProperty(this, 'type', {
            value: 'actor',
            writable: false
        });

        this.left = this.pos.x;
        this.right = this.left + this.size.x;
        this.top = this.pos.y;
        this.bottom = this.top + this.size.y;
    }

    act() {}

    isIntersect(actor) {
        // let result = false;

        if (((actor instanceof Actor) !== true) || (actor === undefined)) { throw Error(); }

        if ((actor.right > this.left) && (actor.left > this.left)) { let result = true; 
        } else { let result = false; }
        if ((actor.right > this.left) && (actor.right < this.right)) { let result = true; 
        } else { let result = false; }


        return result;
        // return (actor.right > this.left) || (actor.right < this.right) ? true: false;
        // x != undefined ? this.x = x: this.x = 0;
    }
    
    
}

