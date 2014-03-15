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

tetris.newGame = function () {
    'use strict';

    for (var hor = 0; hor < tetris.mainWinWidth; hor++) {
        if (!tetris.pile[hor]) {
            tetris.pile[hor] = [];
        }

        tetris.pileAnimLine[hor] = [];
        tetris.pileAnimDrop[hor] = [];

        for (var ver = 0; ver < tetris.mainWinHeight; ver++) {
            if (tetris.pile[hor][ver]) {
                tetris.mainWin.removeChild(tetris.pile[hor][ver]);
            }

            tetris.pile[hor][ver] = false;

            tetris.pileAnimLine[hor][ver] = false;
            tetris.pileAnimDrop[hor][ver] = false;
        }
    }

    tetris.level = 1;
    tetris.score = 0;
    tetris.singles = 0;
    tetris.doubles = 0;
    tetris.triples = 0;
    tetris.quads = 0;

    tetris.updateScore();

    tetris.newShape();
};

tetris.collision = function (hor, ver) {
    'use strict';

    // Left wall
    if (hor < 0) {
        if (tetris.keyPressed === tetris.keyRotate) {
            // No room to rotate, try moving right
            if (!tetris.collision(hor + 1, ver)) {
                tetris.shapePosHor++;

                tetris.drawShape();

                return true;
            }
            else {
                tetris.shapeRot--;

                return true;
            }
        }

        return true;
    }

    // Right wall
    if (hor >= tetris.mainWinWidth) {
        if (tetris.keyPressed === tetris.keyRotate) {
            // No room to rotate, try moving left
            if (!tetris.collision(hor - 1, ver)) {
                tetris.shapePosHor--;

                tetris.drawShape();

                return true;
            }
            else {
                tetris.shapeRot--;

                return true;
            }
        }

        return true;
    }

    // Floor
    if (ver >= tetris.mainWinHeight) {
        if (tetris.keyPressed !== tetris.keyRotate) {
            tetris.shapePosVer--;
        }

        tetris.shapeLanded = true;

        return true;
    }

    // Pile
    if (tetris.pile[hor][ver]) {
        if (tetris.shapePosVer > tetris.prevShapePosVer) {
            tetris.shapeLanded = true;
        }

        return true;
    }

    return false;
};

tetris.timeStep = function () {
    'use strict';

    tetris.shapePosVer++;

    tetris.drawShape();

    if (tetris.shapeLanded) {
        var hor;

        for (var i in tetris.bricks) {
            tetris.pile[tetris.brickPos[i].hor][tetris.brickPos[i].ver] = tetris.bricks[i];
        }

        // Check for completed lines
        var lines = 0;

        for (var ver = 0; ver < tetris.mainWinHeight; ver++) {
            var line = true;

            for (hor = 0; hor < tetris.mainWinWidth; hor++) {
                if (!tetris.pile[hor][ver]) {
                    line = false;
                }
            }

            if (line) {
                lines++;

                // Remove line
                for (hor = 0; hor < tetris.mainWinWidth; hor++) {
                    if (tetris.pile[hor][ver]) {
                        tetris.pileAnimLine[hor][ver] = tetris.pile[hor][ver];

                        setTimeout('tetris.mainWin.removeChild(tetris.pileAnimLine[' + hor + '][' + ver + ']);', hor * 50);

                        tetris.pile[hor][ver] = false;
                    }
                }

                // Drop lines
                for (hor = 0; hor < tetris.mainWinWidth; hor++) {
                    for (var ver2 = ver; ver2 > 0; ver2--) // From bottom to top
                    {
                        if (tetris.pile[hor][ver2]) {
                            tetris.pileAnimDrop[hor][ver2] = tetris.pile[hor][ver2];

                            setTimeout('tetris.pileAnimDrop[' + hor + '][' + ver2 + '].style.top = ( ' + ver2 + ' + 1 ) * tetris.brickSize + \'px\';', tetris.mainWinWidth * 50);

                            tetris.pile[hor][ver2 + 1] = tetris.pile[hor][ver2];
                            tetris.pile[hor][ver2] = false;
                        }
                    }
                }
            }
        }

        tetris.updateScore(lines);

        // Check for game over
        for (hor = 0; hor < tetris.mainWinWidth; hor++) {
            if (tetris.pile[hor][0]) {
                tetris.doGameOver();

                return;
            }
        }

        tetris.newShape();
    }
};

tetris.doGameOver = function () {
    'use strict';

    clearInterval(tetris.intval);

    tetris.message.innerHTML = '<p>Game over <span>Press Spacebar to continue</span></p>';

    tetris.gameOver = true;
};
