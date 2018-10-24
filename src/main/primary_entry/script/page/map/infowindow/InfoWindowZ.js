/**
 * @constructor
 */
const InfoWindowZ = function (opts) {
    const GM = google.maps,
        GE = GM.event,
        iw = new GM.InfoWindow();
    let ce;

    if (!GM.InfoWindowZZ) {
        GM.InfoWindowZZ = Number(GM.Marker.MAX_ZINDEX);
    }

    GE.addListener(iw, 'content_changed', function () {
        if (typeof this.getContent() === 'string') {
            const n = document.createElement('div');
            n.innerHTML = this.getContent();
            this.setContent(n);
            return;
        }
        GE.addListener(this, 'domready',
            function () {
                const _this = this;
                _this.setZIndex(++GM.InfoWindowZZ);
                if (ce) {
                    GM.event.removeListener(ce);
                }
                ce = GE.addDomListener(this.getContent().parentNode
                        .parentNode.parentNode, 'click',
                    function () {
                        _this.setZIndex(++GM.InfoWindowZZ);
                    });
            })
    });

    if (opts) iw.setOptions(opts);
    return iw;
};

export default InfoWindowZ;
