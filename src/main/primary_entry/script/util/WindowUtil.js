/**
 * Utility functions related to functions on the global window object.
 */
export default class Window {

    static isTextSelected() {
        if (window.getSelection) {
            return window.getSelection().toString().length > 0;
        }
        return false;
    }

}