<template>
    <div class="row">
        <div class="col-lg-12">
            <div class="card-box">
                <h4 class="header-title m-t-0"><b>Система</b></h4>
                <p class="text-muted m-b-30 font-13">Информация о системном окружении.</p>

                <table class="table table-condensed m-0">
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th>Статус</th>
                    </tr>
                    </thead>

                    <tbody>

                    <tr v-if="ram">
                        <td>RAM</td>
                        <td>
                            <div class="progress progress-lg m-0">
                                <div class="progress-bar progress-bar-success"
                                     :style="{width: ram.percent + '%'}"></div>
                                <span class="progress__percent">{{parseInt(ram.percent)}}%</span>
                                <span class="progress__busy">{{ram.busy}}</span>
                                <span class="progress__free">{{ram.free}}</span>
                            </div>
                        </td>
                    </tr>

                    <tr v-for="item in diagnostics.info" :key="item.name">
                        <td>{{item.name}}</td>
                        <td>
                            {{item.value}}

                            <template
                                    v-if="('ulimit_soft' === item.type || 'ulimit_hard' === item.type) && item.value < 200000">
                                <br>
                                <pre>Recommended add to "/etc/security/limits.conf"{{'\n'}}file and reboot system:{{'\n\n'}}* soft nofile 1048576{{'\n'}}* hard nofile 1048576</pre>
                            </template>
                            <template v-if="'max_map_count' === item.type && item.value < 200000">
                                <br>
                                <pre>Recommended add to "/etc/sysctl.conf" file and reboot system:{{'\n\n'}}sudo sh -c "echo 'vm.max_map_count=262144' >> /etc/sysctl.conf"</pre>
                            </template>
                            <template v-if="'driver' === item.type && item.info">
                                <br>
                                <pre>{{item.info}}</pre>
                            </template>
                        </td>
                    </tr>

                    </tbody>
                </table>
            </div>

            <div class="card-box">
                <h4 class="header-title m-t-0"><b>Библиотеки</b></h4>
                <p class="text-muted m-b-30 font-13">Проверка наличия необходимых библиотек.</p>

                <table class="table table-condensed m-0 table-info">
                    <thead>
                    <tr>
                        <th>Тип</th>
                        <th>Название</th>
                        <th>Статус</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr v-if="0 === diagnostics.items.length">
                        <td colspan="3" class="text-center">Загрузка...</td>
                    </tr>
                    <tr v-for="item in diagnostics.items" :key="item.name">
                        <td><span class="label label-inverse">{{item.type}}</span></td>
                        <td>
                            {{item.name}}
                            <template v-if="!item.status">
                                <br>
                                <table class="text-dark text-muted tr-title">
                                    <tbody>

                                    <template v-if="'lib' === item.type">
                                        <tr>
                                            <td>{{getArch(32)}}:</td>
                                            <td>{{getFile(item.win32)}}</td>
                                        </tr>
                                        <tr v-if="64 === item.arch">
                                            <td>{{getArch(64)}}:</td>
                                            <td>{{getFile(item.win64)}}</td>
                                        </tr>
                                    </template>

                                    <tr>
                                        <td></td>
                                        <td class="p-t-10">
                                            <pre>sudo dpkg --add-architecture i386{{'\n'}}sudo apt-get install {{getPackages(item.packages)}}</pre>
                                        </td>
                                    </tr>

                                    </tbody>
                                </table>
                            </template>
                        </td>
                        <td>
                        <span class="badge badge-success"
                              :class="{'badge-success' : item.status, 'badge-danger': !item.status}">.
                        </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script>
    import action   from "../store/action";
    import Collects from "../helpers/collects";

    export default {
        name:       'Diagnostics',
        components: {},
        data() {
            return {
                diagnostics: this.$store.state.diagnostics,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('diagnostics').LOAD);
        },
        methods:    {
            getArch(arch) {
                return Collects.arch['win' + arch];
            },
            getFile(file) {
                return file ? file.path : 'missing';
            },
            getPackages(packages) {
                return packages.join(' ') + ' ' + packages.join(':i386 ') + ':i386';
            },
        },
        computed:   {
            ram() {
                return window.app.getSystem().getRam();
            },
        }
    }
</script>

<style lang="less" scoped>
    .badge {
        position: relative;
        color: transparent;
        top: -2px;
        width: 13px;
        height: 13px;
    }

    .tr-title td {
        padding-right: 10px;
    }

    .table-info {
        & > tbody > tr {
            &:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
        }
    }

    .progress {
        position: relative;
    }

    .progress__percent {
        position: absolute;
        color: #fff;
        text-align: center;
        display: block;
        width: 100%;
    }

    .progress__busy, .progress__free {
        position: absolute;
        color: #fff;
    }

    .progress__busy {
        left: 10px;
    }

    .progress__free {
        right: 10px;
    }

    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
</style>