<template>
  <div>
    <button class="btn item-point__button btn-custom"
            :class="{'waves-effect' : !config.launched, 'waves-light' : !config.launched}" @click="open"
            onclick="return false">
      <span>{{ config.launched ? $t('game.stop') : $t('game.play') }}</span>
      <i v-if="!config.launched" class="fa fa-angle-right m-l-10"></i>
    </button>

    <div :id="id" class="modal-demo">
      <ButtonTerminal/>
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        <span class="popup__icon"><img :src="config.icon" alt=""></span>
        {{ config.name }}
      </h4>
      <div class="custom-modal-text text-left">
        <template v-if="popup_opened">
          <form role="form">
            <template v-if="config.launched">
              <div class="form-group m-b-30 text-center">
                <h4 class="m-t-20"><b>{{ $t('game.running') }}</b></h4>

                <div class="form-group text-center m-t-40">
                  <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                          @click="kill">
                    {{ $t('labels.cancel') }}
                  </button>
                </div>
              </div>
            </template>

            <template v-if="!config.launched">
              <div class="form-group m-b-30">
                <label>{{ $t('game.launch-mode') }}</label>
                <OnlySelect :selected.sync="mode" :items="modes"/>
              </div>

              <div class="form-group text-center m-t-40">
                <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                  {{ $t('game.play') }}
                </button>
                <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                        @click="cancel">
                  {{ $t('labels.cancel') }}
                </button>
              </div>
            </template>
          </form>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import action         from '../../store/action';
import OnlySelect     from "../UI/OnlySelect";
import Collects       from "../../helpers/collects";
import AbstractPopup  from "../UI/AbstractPopup";
import ButtonTerminal from "../UI/ButtonTerminal";
import Utils          from "../../modules/utils";

export default {
  mixins:     [ AbstractPopup ],
  components: {
    OnlySelect,
    ButtonTerminal,
  },
  name:       "PopupPlay",
  props:      {
    config: Object,
  },
  data() {
    return {
      id:    action.id,
      games: this.$store.state.games,
      mode:  'standard',
    };
  },
  mounted() {
    if (!window['autostart']) {
      window['autostart'] = {};
    }

    if (window['autostart'][this.config.code]) {
      return;
    }

    let args      = window.app.getCommand().getArguments();
    let game      = (args['game'] || []);
    let autostart = args['autostart'];

    if (autostart && !Object.keys(Collects.modes).includes(autostart)) {
      autostart = 'standard';
    }

    if (game.length > 0 && autostart && this.config.code === game[0]) {
      if (undefined !== args['hide']) {
        window.app.getSystem().window().hide();
      }

      window['autostart'][this.config.code] = true;

      let fs         = window.app.getFileSystem();
      let appFolders = window.app.getAppFolders();
      let games      = appFolders.getGamesDir() + this.config.config.getGamePath();
      let symlinks   = appFolders.getGamesSymlinksDir();

      const waitGame = () => {
        return Utils.sleep(500).then(() => {
          if (fs.exists(games) || fs.exists(symlinks)) {
            return;
          }

          return waitGame();
        });
      }

      waitGame().then(() => {
        this.mode = autostart;
        this.open();
        this.save();
      });
    }
  },
  methods:    {
    open() {
      if (this.config.launched) {
        return this.kill();
      }

      new Custombox.modal({
        content: {
          effect: 'fadein',
          target: `#${this.id}`,
        },
        loader:  {
          active: false,
        },
      }).open();
    },
    save() {
      this.popup_opened = false;
      this.$nextTick(() => {
        this.$store.dispatch(action.get('games').PLAY, { config: this.config, mode: this.mode });
        this.popup_opened = true;
      });
    },
    cancel() {
      return Custombox.modal.close();
    },
    kill() {
      this.config.config.killProcess();
    },
  },
  computed:   {
    modes() {
      return Collects.getToSelect('modes');
    },
  }
}
</script>

<style lang="less" scoped>
.custom-modal-title {
  padding-left: 60px;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 80px;
}

.modal-demo {
  width: 400px;
}

.custom-modal-text {
  position: relative;

  form {
    position: relative;
  }
}
</style>