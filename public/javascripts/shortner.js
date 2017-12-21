(function ($) {
    const _shortner = function (data) {
        this._api_ = '/api/v1/shorten/';
        this._form_ = '#shortner';
        this._errormsg_ = 'An error occurred shortening that link';
    };

    _shortner.prototype.init = function () {
        this._input_ = $(this._form_).find('input');

        if (!this.check(this._input_.val())) {
            return this.alert(this._errormsg_, true);
        }

        this.request(this._input_.val());
    };

    _shortner.prototype.check = function (s) {
        const regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
    };

    _shortner.prototype.alert = function (message, error) {
        const t = error === true ? 'alert-danger' : 'alert-success';

        $('.alert').alert('close');
        $(`<div class="alert ${t} alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden=true>&times;</span>
            </button>
            ${message}
            </div>`).insertBefore(this._form_);
    };
    
    _shortner.prototype.request = function (url) {
        const self = this;
        $.post(self._api_, {long_url: url}, function (data) {
            if (data.hasOwnProperty('status_code') && data.hasOwnProperty('status_txt')) {
                if (parseInt(data.status_code) == 200) {
                    self._input_.val(data.short_url).select();
                    return self.alert('Copy your shortened url');
                } else {
                    self._errormsg_ = data.status_txt;
                }
            }
            return self.alert(self._errormsg_, true);
        }).error(function () {
            return self.alert(self._errormsg_, true);
        });
    };
    
    $(function () {
        var s = new _shortner();
        var clipboard = new Clipboard('.btn');

        $(s._form_).on('submit', function (e) {
            e && e.preventDefault();
            s.init();

            clipboard.on('success', function(e) {
                s.alert('Copied to clipboard!');
            });

            clipboard.on('error', function(e) {
                s.alert('Error copying to clipboard', true);
            });
        });
    });
})(window.jQuery);