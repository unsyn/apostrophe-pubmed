apos.define('apostrophe-crossref-editor-modal', {
  extend: 'apostrophe-pieces-editor-modal',

  construct: function(self, options) {
    var superBeforeShow = self.beforeShow;

    self.beforeShow = function(callback) {
      return superBeforeShow(function(err) {
        if (err) {
          return callback(err);
        }

        if (!options.crossrefConfig) {
          console.log('CrossRef module needs a field to enhance and sync map');
          return callback(null);
        }

        if (!options.crossrefConfig.enhanceField) {
          console.log('Need a field to enhance with the sync button. This is the name of a field in your schema (should be something like crossrefId)');
          return callback(null);
        }

        if (!options.crossrefConfig.mapFields) {
          console.log('Need a mapFields object in crossref modules config. { "apostropheField" : "crossrefField" }');
          return callback(null);
        }

        var animationClass = "apos-crossref-autocompleted"
        var $enhanceTarget = self.$el.find('[data-name="'+ options.crossrefConfig.enhanceField +'"]');
        var enhanceTargetLabel = $enhanceTarget.find('.apos-field-label').text();

        $enhanceTarget
          .addClass('apos-crossref-enhanced-fieldset')
          .append('<a href="#" class="apos-button apos-crossref-sync-button" data-crossref-sync-button>Sync from CrossRef</a>');

        self.$el.find('[data-crossref-sync-button]').on('click', function() {

          var id = $enhanceTarget.find('input').val();

          apos.ui.globalBusy(true);
          var request = $.ajax({
            url: self.action + '/crossref/' + encodeURIComponent(id),
            method: "GET",
            dataType: "json"
          });

          request.always(function() {
            apos.ui.globalBusy(false);
          });

          request.done(function(response) {
            if (response.error) {
              $enhanceTarget
                .removeClass('apos-error')
                .addClass('apos-warning');

                if ($enhanceTarget.find('.apos-field-help').length) {
                  $enhanceTarget.find('.apos-field-help').attr('data-content', 'Warning: ' + response.body);
                } else {
                  $enhanceTarget.find('.apos-field-label').append(' ('+ response.body +')');
                }
                return;
            }

            self.$el.find('input').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
              $(this).removeClass(animationClass);
            })

            $enhanceTarget
              .removeClass('apos-warning')
              .removeClass('apos-error')
              .addClass('pl-success')
              .find('.apos-field-label').text(enhanceTargetLabel)

            Object.keys(options.crossrefConfig.mapFields).map(function (key) {
              self.$el.find('[name="'+ key +'"]')
                .val(response.body[options.crossrefConfig.mapFields[key]])
                .addClass(animationClass)
            });

            // set slug on its own
            self.$el.find('[name="slug"]')
              .val(apos.utils.slugify(response.body.title))
              .addClass(animationClass)

          }); // end '.done'

          request.fail(function( jqXHR, textStatus ) {
            console.log(jqXHR);
            console.log( "Request failed: " + textStatus );
            $enhanceTarget
              .removeClass('apos-warning')
              .addClass('apos-error')

            if ($enhanceTarget.find('.apos-field-help').length) {
              $enhanceTarget.find('.apos-field-help').attr('data-content', 'Error: ' + textStatus);
            } else {
              $enhanceTarget.find('.apos-field-label').append(' (Error: '+ textStatus +')');
            }

          });

        })

        return callback(null);
      });
    };
  }
});
