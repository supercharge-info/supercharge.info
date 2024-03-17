import $ from "jquery";
import ServiceURL from "./ServiceURL";

export default class UpdateCheck {

    static loaded = Date.now();

    static doCheck() {
        return $.getJSON(ServiceURL.DB_INFO).done(
            (dbInfo) => {
                console.log(`UpdateCheck loaded=${UpdateCheck.loaded} lastModified=${dbInfo.lastModified} reload=${UpdateCheck.loaded <= dbInfo.lastModified}`);
                if (!dbInfo || UpdateCheck.loaded > dbInfo.lastModified) return;
                UpdateCheck.showNotification();
                UpdateCheck.loaded = Date.now();
            }
        );
    }

    static showNotification() {
        if ($('#db-update-notify').length > 0) return;

        const alertDiv = $('<div/>', {id: 'db-update-notify', class: 'alert alert-info', role: 'alert'});

        const button = $('<button/>', {type: 'button', class: 'close'});
        button.attr('data-dismiss', 'alert');
        button.attr('aria-label', 'close');
        button.html("x");
        button.on('click', () => { UpdateCheck.loaded = Date.now(); });

        const link = $("<a>click to reload</a>", {href: '#'});
        link.on('click', () => { location.reload(); });

        alertDiv.append("<span>Site database updated - </span>");
        alertDiv.append(link);
        alertDiv.append("<span>.</span>");
        alertDiv.append(button);

        $(".layout-header").prepend(alertDiv);
    }

}