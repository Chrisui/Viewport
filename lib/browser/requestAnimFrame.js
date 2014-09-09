/**
 * Return correct reference to browser requestAnimationFrame function
 * or default back to a timeout
 * @type {function}
 */
exports = module.exports = (function(root){

    return root.requestAnimationFrame		||
        root.webkitRequestAnimationFrame	||
        root.mozRequestAnimationFrame		||
        root.oRequestAnimationFrame		    ||
        root.msRequestAnimationFrame		||
        function(callback){
            setTimeout(callback, 1000 / 60);
        };

})(this);