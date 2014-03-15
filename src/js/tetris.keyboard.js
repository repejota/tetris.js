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

tetris.keyDrop = 32; // Space bar
tetris.keyLeft = 37; // Left key
tetris.keyRotate = 38; // Up key
tetris.keyRight = 39; // Right key
tetris.keyDown = 40; // Down key
tetris.keyPause = 19; // Pause key
tetris.keyStop = 27; // Esc key

tetris.keyListener = function (e) {
    'use strict';

    if (!e) // IE
    {
        e = window.event;
    }

    tetris.keyPressed = e.keyCode;

    if (tetris.gameStart) {
        tetris.gameStart = false;

        tetris.message.innerHTML = '';

        tetris.newGame();
    }
    else {
        if (tetris.gameOver && e.keyCode === tetris.keyDrop) {
            tetris.gameOver = false;

            tetris.message.innerHTML = '';

            tetris.newGame();
        }
        else if (!tetris.gameOver) {
            if (e.keyCode === tetris.keyStop || e.keyCode === tetris.keyPause) {
                tetris.paused = !tetris.paused;

                if (tetris.paused) {
                    tetris.message.innerHTML = tetris.strings.gamePauseMessage;
                }
                else {
                    tetris.message.innerHTML = '';
                }

                return false;
            }

            if (!tetris.paused) {
                if (e.keyCode === tetris.keyDrop) {
                    clearInterval(tetris.intval);

                    tetris.intval = setInterval(function () {
                        tetris.timeStep();
                    }, 20);

                    return false;
                }

                if (e.keyCode === tetris.keyLeft) {
                    tetris.shapePosHor--;

                    tetris.drawShape();

                    return false;
                }

                if (e.keyCode === tetris.keyRotate) {
                    tetris.shapeRot = ( tetris.shapeRot + 1 ) % 4;

                    tetris.drawShape();

                    return false;
                }

                if (e.keyCode === tetris.keyRight) {
                    tetris.shapePosHor++;

                    tetris.drawShape();

                    return false;
                }

                if (e.keyCode === tetris.keyDown) {
                    tetris.shapePosVer++;

                    tetris.drawShape();

                    return false;
                }
            }
        }
    }

    return true;
};