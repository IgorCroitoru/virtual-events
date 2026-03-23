import { Boot } from './scenes/Boot';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,

    
    parent: 'game-container',
    backgroundColor: '#213433',
    scene: [
        Boot,
        Preloader,

    ],
    scale: {
        mode: Phaser.Scale.RESIZE, // ✅ Makes game resize automatically
        //autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ Centers the game
    },
};

const StartGame = (parent: string) => {
    console.log("Windows innerWidth", window.innerWidth);
    const game = new Game({ ...config, parent });
    return game;

}

export default StartGame;
