//
// BEGIN LICENSE BLOCK
//
// The MIT License (MIT)
//
// Copyright (c) 2014 Raül Pérez
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// END LICENSE BLOCK
//

var tetris = tetris || {};

tetris.newShape = function () {
    'use strict';

    tetris.shapeCount++;

    tetris.shapeNum = typeof(tetris.shapeNumNext) !== 'undefined' ? tetris.shapeNumNext : Math.floor(Math.random() * 6);
    tetris.shapeNumNext = Math.floor(Math.random() * 7);
    tetris.shapeRot = typeof(tetris.shapeRotNext) !== 'undefined' ? tetris.shapeRotNext : Math.floor(Math.random() * 4);
    tetris.shapeRotNext = Math.floor(Math.random() * 4);
    tetris.shapePosHor = Math.floor(Math.random() * ( tetris.mainWinWidth - 6 )) + 3;
    tetris.shapePosVer = -1;

    tetris.drawShape();

    tetris.drawNext();

    tetris.shapeLanded = false;

    clearInterval(tetris.intval);

    tetris.intval = setInterval(function () {
        tetris.timeStep();
    }, 2000 / tetris.level);
};

tetris.newBrick = function (color, colorLight, colorDark) {
    'use strict';

    var brick = document.createElement('div');

    brick.setAttribute('style', 'background: ' + color + '; border-color: ' + colorLight + ' ' + colorDark + ' ' + colorDark + ' ' + colorLight + '; border-width: ' + tetris.brickBorderSize + 'px; border-style: solid; height: ' + ( tetris.brickSize - tetris.brickBorderSize * 2 ) + 'px; left: 0; top: 0; width: ' + ( tetris.brickSize - tetris.brickBorderSize * 2 ) + 'px; position: absolute;');

    return brick;
};

tetris.drawShape = function () {
    'use strict';

    var brickCount = 0;
    var move = true;

    tetris.brickPos = [];

    for (var ver = 0; ver < 4; ver++) {
        for (var hor = 0; hor < 4; hor++) {
            if (tetris.brickLib[tetris.shapeNum][ver * 4 + hor + tetris.shapeRot * 16]) {
                tetris.brickPos[brickCount] = {
                    hor: hor + tetris.shapePosHor,
                    ver: ver + tetris.shapePosVer
                };

                if (tetris.collision(tetris.brickPos[brickCount].hor, tetris.brickPos[brickCount].ver)) {
                    move = false;
                }

                brickCount++;
            }
        }
    }

    if (move && !tetris.paused && !tetris.gameOver) {
        var i;
        var prevBricks = tetris.bricks ? tetris.bricks.slice(0) : false;

        for (i = 0; i < brickCount; i++) {
            tetris.bricks[i] = tetris.newBrick(
                tetris.brickLib[tetris.shapeNum][64], tetris.brickLib[tetris.shapeNum][65], tetris.brickLib[tetris.shapeNum][66]
            );

            tetris.bricks[i].num = tetris.shapeCount;

            tetris.bricks[i].style.left = tetris.brickPos[i].hor * tetris.brickSize + 'px';
            tetris.bricks[i].style.top = tetris.brickPos[i].ver * tetris.brickSize + 'px';
        }

        for (i = 0; i < brickCount; i++) // Using seperate for-loops to reduce flickering
        {
            // Draw brick in new position
            tetris.mainWin.appendChild(tetris.bricks[i]);
        }

        for (i = 0; i < brickCount; i++) {
            // Remove brick in prev position
            if (prevBricks[i] && prevBricks[i].num === tetris.shapeCount) {
                tetris.mainWin.removeChild(prevBricks[i]);
            }
        }

        tetris.prevShapeRot = tetris.shapeRot;
        tetris.prevShapePosHor = tetris.shapePosHor;
        tetris.prevShapePosVer = tetris.shapePosVer;
        tetris.prevBrickPos = tetris.brickPos.slice(0);
    }
    else {
        // Collision detected, keep shape in previous position
        tetris.shapeRot = tetris.prevShapeRot;
        tetris.shapePosHor = tetris.prevShapePosHor;
        tetris.shapePosVer = tetris.prevShapePosVer;
        tetris.brickPos = tetris.prevBrickPos.slice(0);
    }
};

tetris.drawNext = function () {
    'use strict';
    tetris.nextWin.innerHTML = '';

    for (var ver = 0; ver < 4; ver++) {
        for (var hor = 0; hor < 4; hor++) {
            if (tetris.brickLib[tetris.shapeNumNext][ver * 4 + hor + tetris.shapeRotNext * 16]) {
                var brick;

                brick = tetris.newBrick(
                    tetris.brickLib[tetris.shapeNumNext][64], tetris.brickLib[tetris.shapeNumNext][65], tetris.brickLib[tetris.shapeNumNext][66]
                );

                brick.style.left = hor * tetris.brickSize + 'px';
                brick.style.top = ver * tetris.brickSize + 'px';

                tetris.nextWin.appendChild(brick);
            }
        }
    }
};

tetris.flashMessage = function (message) {
    'use strict';
    tetris.message.innerHTML = message;

    setTimeout(function () {
        tetris.message.innerHTML = "";
    }, 1000);
};