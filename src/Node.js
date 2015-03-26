var LocalDispatch = require('./LocalDispatch');


function Node () {
    this._dispatch = new LocalDispatch();
    this._children = new Children(this._dispatch);
    this._context = new RenderContext(this._dispatch);
    this._transform = new Transform(this._dispatch);
    this._size = new Size(this._dispatch);
}