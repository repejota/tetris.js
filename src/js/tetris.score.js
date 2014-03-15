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

tetris.levelUpScore = 150;
tetris.level = 1;
tetris.score = 0;
tetris.singles = 0;
tetris.doubles = 0;
tetris.triples = 0;
tetris.quads = 0;

tetris.updateScore = function (lines) {
    'use strict';

    var oldScore = tetris.score;
    if (lines) {
        tetris.score += lines * lines + lines * 10;
    }

    var i;
    for (i = oldScore; i < tetris.score; i++) {
        setTimeout('document.getElementById(\'tetris-score\').innerHTML = \'' + i + '\';', ( i - oldScore ) * 20);
    }

    tetris.level = Math.floor(tetris.score / tetris.levelUpScore) + 1;
    document.getElementById('tetris-level').innerHTML = tetris.level;

    if (lines === 1) {
        tetris.singles++;
        document.getElementById('tetris-singles').innerHTML = tetris.singles;
    }

    if (lines === 2) {
        tetris.flashMessage(tetris.strings.flashDoubleMessage);
        tetris.doubles++;
        document.getElementById('tetris-doubles').innerHTML = tetris.doubles;
    }

    if (lines === 3) {
        tetris.flashMessage(tetris.strings.flashTripleMessage);
        tetris.triples++;
        document.getElementById('tetris-triples').innerHTML = tetris.triples;
    }

    if (lines === 4) {
        tetris.flashMessage(tetris.strings.flashTetrisMessage);
        tetris.quads++;
        document.getElementById('tetris-quads').innerHTML = tetris.quads;
    }
};