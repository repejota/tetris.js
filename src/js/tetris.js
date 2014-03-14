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

var tetris = {
		brickSize:       30,
		brickBorderSize: 2,
		mainWinWidth:    10,
		mainWinHeight:   20,
		levelUpScore:    150,

		level:   1,
		score:   0,
		singles: 0,
		doubles: 0,
		triples: 0,
		quads:   0,

		bricks:       [],
		pile:         [],
		pileAnimLine: [],
		pileAnimDrop: [],
		gameStart:    true,
		gameOver:     false,
		paused:       false,
		keyPressed:   false,
		shapeCount:   0,

		keyDrop:   32, // Space bar
		keyLeft:   37, // Left key
		keyRotate: 38, // Up key
		keyRight:  39, // Right key
		keyDown:   40, // Down key
		keyPause:  19, // Pause key
		keyStop:   27, // Esc key

		init: function()
		{
			tetris.mainWin = document.getElementById('tetris-main');
			tetris.nextWin = document.getElementById('tetris-next-inner');
			tetris.message = document.getElementById('tetris-message');

			tetris.message.innerHTML = '<p>New game <span>Press any key to start</span></p>';

			document.onkeydown = tetris.keyListener;
		},

		newGame: function()
		{
			for ( var hor = 0; hor < tetris.mainWinWidth; hor ++ )
			{
				if ( !tetris.pile[hor] ) {
                    tetris.pile[hor] = [];
                }

				tetris.pileAnimLine[hor] = [];
				tetris.pileAnimDrop[hor] = [];

				for ( var ver = 0; ver < tetris.mainWinHeight; ver ++ )
				{
					if ( tetris.pile[hor][ver] )
					{
						tetris.mainWin.removeChild(tetris.pile[hor][ver]);
					}

					tetris.pile[hor][ver] = false;

					tetris.pileAnimLine[hor][ver] = false;
					tetris.pileAnimDrop[hor][ver] = false;
				}
			}

			tetris.level   = 1;
			tetris.score   = 0;
			tetris.singles = 0;
			tetris.doubles = 0;
			tetris.triples = 0;
			tetris.quads   = 0;

			tetris.updateScore();

			tetris.newShape();
		},

		newShape: function()
		{
			tetris.shapeCount ++;

			tetris.shapeNum     = typeof(tetris.shapeNumNext) !== 'undefined' ? tetris.shapeNumNext : Math.floor(Math.random() * 6);
			tetris.shapeNumNext = Math.floor(Math.random() * 7);
			tetris.shapeRot     = typeof(tetris.shapeRotNext) !== 'undefined' ? tetris.shapeRotNext : Math.floor(Math.random() * 4);
			tetris.shapeRotNext = Math.floor(Math.random() * 4);
			tetris.shapePosHor  = Math.floor(Math.random() * ( tetris.mainWinWidth - 6 )) + 3;
			tetris.shapePosVer  = -1;

			tetris.drawShape();

			tetris.drawNext();

			tetris.shapeLanded = false;

			clearInterval(tetris.intval);

			tetris.intval = setInterval(function () {
                tetris.timeStep();
            }, 2000 / tetris.level);
		},

		newBrick: function(color, colorLight, colorDark)
		{
			var
				brick = document.createElement('div')
				;

			brick.setAttribute('style', 'background: ' + color + '; border-color: ' + colorLight + ' ' + colorDark + ' ' + colorDark + ' ' + colorLight + '; border-width: ' + tetris.brickBorderSize + 'px; border-style: solid; height: ' + ( tetris.brickSize - tetris.brickBorderSize * 2 ) + 'px; left: 0; top: 0; width: ' + ( tetris.brickSize - tetris.brickBorderSize * 2 ) + 'px; position: absolute;');

			return brick;
		},

		drawShape: function()
		{
			var
				brickCount = 0,
				move       = true
				;

			tetris.brickPos = [];

			for ( var ver = 0; ver < 4; ver ++ )
			{
				for ( var hor = 0; hor < 4; hor ++ )
				{
					if ( tetris.brickLib[tetris.shapeNum][ver * 4 + hor + tetris.shapeRot * 16] )
					{
						tetris.brickPos[brickCount] = {
							hor: hor + tetris.shapePosHor,
							ver: ver + tetris.shapePosVer
							};

						if ( tetris.collision(tetris.brickPos[brickCount].hor, tetris.brickPos[brickCount].ver) ) {
                            move = false;
                        }

						brickCount ++;
					}
				}
			}

			if ( move && !tetris.paused && !tetris.gameOver )
			{
                var i;
				var prevBricks = tetris.bricks ? tetris.bricks.slice(0) : false;

				for ( i = 0; i < brickCount; i ++ )
				{
					tetris.bricks[i] = tetris.newBrick(
						tetris.brickLib[tetris.shapeNum][64], tetris.brickLib[tetris.shapeNum][65], tetris.brickLib[tetris.shapeNum][66]
						);

					tetris.bricks[i].num = tetris.shapeCount;

					tetris.bricks[i].style.left = tetris.brickPos[i].hor * tetris.brickSize + 'px';
					tetris.bricks[i].style.top  = tetris.brickPos[i].ver * tetris.brickSize + 'px';
				}

				for ( i = 0; i < brickCount; i ++ ) // Using seperate for-loops to reduce flickering
				{
					// Draw brick in new position
					tetris.mainWin.appendChild(tetris.bricks[i]);
				}

				for ( i = 0; i < brickCount; i ++ )
				{
					// Remove brick in prev position
					if ( prevBricks[i] && prevBricks[i].num === tetris.shapeCount )
					{
						tetris.mainWin.removeChild(prevBricks[i]);
					}
				}

				tetris.prevShapeRot    = tetris.shapeRot;
				tetris.prevShapePosHor = tetris.shapePosHor;
				tetris.prevShapePosVer = tetris.shapePosVer;
				tetris.prevBrickPos    = tetris.brickPos.slice(0);
			}
			else
			{
				// Collision detected, keep shape in previous position
				tetris.shapeRot    = tetris.prevShapeRot;
				tetris.shapePosHor = tetris.prevShapePosHor;
				tetris.shapePosVer = tetris.prevShapePosVer;
				tetris.brickPos    = tetris.prevBrickPos.slice(0);
			}
		},

		drawNext: function()
		{
			tetris.nextWin.innerHTML = '';

			for ( var ver = 0; ver < 4; ver ++ )
			{
				for ( var hor = 0; hor < 4; hor ++ )
				{
					if ( tetris.brickLib[tetris.shapeNumNext][ver * 4 + hor + tetris.shapeRotNext * 16] )
					{
                        var brick;

						brick = tetris.newBrick(
							tetris.brickLib[tetris.shapeNumNext][64], tetris.brickLib[tetris.shapeNumNext][65], tetris.brickLib[tetris.shapeNumNext][66]
							);

						brick.style.left = hor * tetris.brickSize + 'px';
						brick.style.top  = ver * tetris.brickSize + 'px';

						tetris.nextWin.appendChild(brick);
					}
				}
			}
		},

		collision: function(hor, ver)
		{
			// Left wall
			if ( hor < 0 )
			{
				if ( tetris.keyPressed === tetris.keyRotate )
				{
					// No room to rotate, try moving right
					if ( !tetris.collision(hor + 1, ver) )
					{
						tetris.shapePosHor ++;

						tetris.drawShape();

						return true;
					}
					else
					{
						tetris.shapeRot --;

						return true;
					}
				}

				return true;
			}

			// Right wall
			if ( hor >= tetris.mainWinWidth )
			{
				if ( tetris.keyPressed === tetris.keyRotate )
				{
					// No room to rotate, try moving left
					if ( !tetris.collision(hor - 1, ver) )
					{
						tetris.shapePosHor --;

						tetris.drawShape();

						return true;
					}
					else
					{
						tetris.shapeRot --;

						return true;
					}
				}

				return true;
			}

			// Floor
			if ( ver >= tetris.mainWinHeight )
			{
				if ( tetris.keyPressed !== tetris.keyRotate ) {
                    tetris.shapePosVer --;
                }

				tetris.shapeLanded = true;

				return true;
			}

			// Pile
			if ( tetris.pile[hor][ver] )
			{
				if ( tetris.shapePosVer > tetris.prevShapePosVer ) {
                    tetris.shapeLanded = true;
                }

				return true;
			}

			return false;
		},

		timeStep: function()
		{
			tetris.shapePosVer ++;

			tetris.drawShape();

			if ( tetris.shapeLanded )
			{
                var hor;

				for ( var i in tetris.bricks )
				{
					tetris.pile[tetris.brickPos[i].hor][tetris.brickPos[i].ver] = tetris.bricks[i];
				}

				// Check for completed lines
				var lines = 0;

				for ( var ver = 0; ver < tetris.mainWinHeight; ver ++ )
				{
					var line = true;

					for ( hor = 0; hor < tetris.mainWinWidth; hor ++ )
					{
						if ( !tetris.pile[hor][ver] ) {
                            line = false;
                        }
					}

					if ( line )
					{
						lines ++;

						// Remove line
						for ( hor = 0; hor < tetris.mainWinWidth; hor ++ )
						{
							if ( tetris.pile[hor][ver] )
							{
								tetris.pileAnimLine[hor][ver] = tetris.pile[hor][ver];

								setTimeout('tetris.mainWin.removeChild(tetris.pileAnimLine[' + hor + '][' + ver + ']);', hor * 50);

								tetris.pile[hor][ver] = false;
							}
						}

						// Drop lines
						for ( hor = 0; hor < tetris.mainWinWidth; hor ++ )
						{
							for ( var ver2 = ver; ver2 > 0; ver2 -- ) // From bottom to top
							{
								if ( tetris.pile[hor][ver2] )
								{
									tetris.pileAnimDrop[hor][ver2] = tetris.pile[hor][ver2];

									setTimeout('tetris.pileAnimDrop[' + hor + '][' + ver2 + '].style.top = ( ' + ver2 + ' + 1 ) * tetris.brickSize + \'px\';', tetris.mainWinWidth * 50);

									tetris.pile[hor][ver2 + 1] = tetris.pile[hor][ver2];
									tetris.pile[hor][ver2]     = false;
								}
							}
						}
					}
				}

				tetris.updateScore(lines);

				// Check for game over
				for ( hor = 0; hor < tetris.mainWinWidth; hor ++ )
				{
					if ( tetris.pile[hor][0] )
					{
						tetris.doGameOver();

						return;
					}
				}

				tetris.newShape();
			}
		},

		updateScore: function(lines)
		{
			var oldScore = tetris.score;

			if ( lines )
			{
				tetris.score += lines * lines + lines * 10;
			}

            var i;

			for ( i = oldScore; i < tetris.score; i ++ )
			{
				setTimeout('document.getElementById(\'tetris-score\').innerHTML = \'' + i + '\';', ( i - oldScore ) * 20);
			}

			tetris.level = Math.floor(tetris.score / tetris.levelUpScore) + 1;

			document.getElementById('tetris-level').innerHTML = tetris.level;

			if ( lines === 1 )
			{
				tetris.singles ++;

				document.getElementById('tetris-singles').innerHTML = tetris.singles;
			}

			if ( lines === 2 )
			{
				tetris.flashMessage('<p class="tetris-double">Double!</p>');

				tetris.doubles ++;

				document.getElementById('tetris-doubles').innerHTML = tetris.doubles;
			}

			if ( lines === 3 )
			{
				tetris.flashMessage('<p class="tetris-double">Triple!</p>');

				tetris.triples ++;

				document.getElementById('tetris-triples').innerHTML = tetris.triples;
			}

			if ( lines === 4 )
			{
				tetris.flashMessage('<p class="tetris-double">Tetris!</p>');

				tetris.quads ++;

				document.getElementById('tetris-quads').innerHTML = tetris.quads;
			}
		},

		flashMessage: function(message)
		{
			tetris.message.innerHTML = message;

			setTimeout(function () {
                "use strict";
                tetris.message.innerHTML = "";
            }, 1000);
		},

		doGameOver: function()
		{
			clearInterval(tetris.intval);

			tetris.message.innerHTML = '<p>Game over <span>Press Spacebar to continue</span></p>';

			tetris.gameOver = true;
		},

		keyListener: function(e)
		{
			if( !e ) // IE
			{
				e = window.event;
			}

			tetris.keyPressed = e.keyCode;

			if ( tetris.gameStart )
			{
				tetris.gameStart = false;

				tetris.message.innerHTML = '';

				tetris.newGame();
			}
			else
			{
				if ( tetris.gameOver && e.keyCode === tetris.keyDrop )
				{
					tetris.gameOver = false;

					tetris.message.innerHTML = '';

					tetris.newGame();
				}
				else if ( !tetris.gameOver )
				{
					if ( e.keyCode === tetris.keyStop || e.keyCode === tetris.keyPause )
					{
						tetris.paused = !tetris.paused;

						if ( tetris.paused )
						{
							tetris.message.innerHTML = '<p>Paused <span>Press Esc to resume</span></p>';
						}
						else
						{
							tetris.message.innerHTML = '';
						}

						return false;
					}

					if ( !tetris.paused )
					{
						if ( e.keyCode === tetris.keyDrop )
						{
							clearInterval(tetris.intval);

							tetris.intval = setInterval(function () {
                                "use strict";
                                tetris.timeStep();
                            }, 20);

							return false;
						}

						if ( e.keyCode === tetris.keyLeft )
						{
							tetris.shapePosHor --;

							tetris.drawShape();

							return false;
						}

						if ( e.keyCode === tetris.keyRotate )
						{
							tetris.shapeRot = ( tetris.shapeRot + 1 ) % 4;

							tetris.drawShape();

							return false;
						}

						if( e.keyCode === tetris.keyRight )
						{
							tetris.shapePosHor ++;

							tetris.drawShape();

							return false;
						}

						if ( e.keyCode === tetris.keyDown )
						{
							tetris.shapePosVer ++;

							tetris.drawShape();

							return false;
						}
					}
				}
			}

			return true;
		},

		brickLib: {
			0: [
				1, 0, 0, 0,
				1, 0, 0, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,

				1, 1, 1, 0,
				1, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 1, 1, 0,
				0, 0, 1, 0,
				0, 0, 1, 0,
				0, 0, 0, 0,

				0, 0, 0, 0,
				0, 0, 1, 0,
				1, 1, 1, 0,
				0, 0, 0, 0,

				'#F90', '#FC0', '#F60'
				],
			1: [
				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,

				0, 0, 0, 0,
				1, 1, 1, 1,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,

				0, 0, 0, 0,
				1, 1, 1, 1,
				0, 0, 0, 0,
				0, 0, 0, 0,

				'#C00', '#E00', '#B00'
				],

			2: [
				1, 1, 0, 0,
				1, 0, 0, 0,
				1, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 1, 0,
				0, 0, 1, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 0, 1, 0,
				0, 0, 1, 0,
				0, 1, 1, 0,
				0, 0, 0, 0,

				0, 0, 0, 0,
				1, 0, 0, 0,
				1, 1, 1, 0,
				0, 0, 0, 0,

				'#0C0', '#0E0', '#0A0'
				],

			3: [
				1, 0, 0, 0,
				1, 1, 0, 0,
				1, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 1, 0,
				0, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 0, 1, 0,
				0, 1, 1, 0,
				0, 0, 1, 0,
				0, 0, 0, 0,

				0, 0, 0, 0,
				0, 1, 0, 0,
				1, 1, 1, 0,
				0, 0, 0, 0,

				'#00C', '#00E', '#00A'
				],

			4: [
				1, 1, 0, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 0, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 0, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 0, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				'#60C', '#80E', '#40A'
				],

			5: [
				0, 1, 1, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				1, 0, 0, 0,
				1, 1, 0, 0,
				0, 1, 0, 0,
				0, 0, 0, 0,

				0, 1, 1, 0,
				1, 1, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				1, 0, 0, 0,
				1, 1, 0, 0,
				0, 1, 0, 0,
				0, 0, 0, 0,

				'#CCC', '#EEE', '#AAA'
				],

			6: [
				1, 1, 0, 0,
				0, 1, 1, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 1, 0, 0,
				1, 1, 0, 0,
				1, 0, 0, 0,
				0, 0, 0, 0,

				1, 1, 0, 0,
				0, 1, 1, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,

				0, 1, 0, 0,
				1, 1, 0, 0,
				1, 0, 0, 0,
				0, 0, 0, 0,

				'#CC0', '#EE0', '#AA0'
				]
		}
	};

window.onload = tetris.init;
