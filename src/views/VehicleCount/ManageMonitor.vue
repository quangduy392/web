<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item
                        to="/vehicle-count/manage/region"
                        class="text-nowrap"
                    >{{ $t('peopleCount.manage.region') }}</b-nav-item>
                    <b-nav-item
                        to="/vehicle-count/manage/profile"
                        class="text-nowrap"
                    >{{ $t('profile.pageTitle') }}</b-nav-item>
                    <b-nav-item
                        to="/vehicle-count/manage/monitor"
                        class="text-nowrap"
                    >{{ $t('peopleCount.manage.monitor') }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <div class="d-flex justify-content-end align-items-center">
                    <div class="input-group border-bottom position-relative" style="width: 190px;">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button
                            variant="outline-primary"
                            v-b-modal.monitor-modal
                            @click="openAddMonitor()"
                        >
                            <i class="fa fa-plus-circle mr-2"></i>
                            <span>{{ $t('alert.createAlert') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content pb-0 p-4">
            <b-table
                striped
                hover
                dark
                show-empty
                responsive
                :items="displayedMonitors()"
                :fields="fields"
                :current-page="currentPage"
                :per-page="CONSTANTS.ALERT_ITEM_PER_PAGE"
            >
                <template slot="index" slot-scope="data">{{
                    (currentPage - 1) * CONSTANTS.ALERT_ITEM_PER_PAGE + (data.index + 1)
                }}</template>
                <template slot="imageUrl" slot-scope="data">
                    <div
                        class="case-video-thumbnail text-center position-relative border border-gray-500 rounded"
                        :style="{ 'background-image': `url(${data.value})` }"
                        v-b-tooltip.hover
                        v-b-modal.region-modal-preview
                        @click="openRegionModalPreview(data.item)"
                    >
                    <v-stage
                        ref="stage"
                        :config="configKonva1"
                    >
                        <v-layer>
                            <v-image :config="{ width: 160, height: 90 }" />
                            <v-line
                                v-for="(item, index) in rePoint(data.item.regions)"
                                :key="index"
                                :config="{
                                    points: _.flatten(item),
                                    closed: true,
                                    fill: 'red',
                                    stroke: 'rgb(0, 255, 43)',
                                    lineJoin: 'round',
                                    opacity: 0.3
                                }"
                            />
                            <v-line
                                :config="{
                                    points: _.flatten(item.points),
                                    closed: false,
                                    stroke: 'rgb(0, 255, 43)',
                                    opacity: 0.3,
                                    lineJoin: 'round'
                                }"
                            />
                            <v-circle
                                v-for="(point, index) in drawingPoint"
                                :key="'c' + index"
                                :config="{
                                    x: point[0],
                                    y: point[1],
                                    radius: index === hovingPoint ? 10 : 5,
                                    fill: 'orange',
                                    strokeWidth: 1
                                }"
                            />
                        </v-layer>
                    </v-stage>
                    </div>
                </template>
                <template slot="type" slot-scope="row">
                    <span v-line-clamp="1">{{ getTypeName(row.value) }}</span>
                </template>
                <template slot="cameraId" slot-scope="row">
                    <span>{{ getCameraName(row.value) }}</span>
                </template>
                <template slot="fps" slot-scope="row">
                    <div v-if="row.value > 10"><span><b><p style="color: green">{{ row.value }}</p></b></span></div>
                    <div v-if="row.value >= 5 && row.value <=10"><span><b><p style="color: yellow">{{ row.value }}</p></b></span></div>
                    <div v-if="row.value < 5"><span><b><p style="color: red">{{ row.value }}</p></b></span></div>
                </template>
                <template slot="error" slot-scope="row">
                    <div style="width: 10px"><span v-if="row.value == 0 && ifRun(row.value)">
                        <p style="color: green">
                            <p>   </p><i class="fa fa-check" style="color:green"></i>
                        </p>
                    </span>
                    <span v-if="row.value == 0 && !ifRun(row.value)">
                        <p style="color: green">
                            <p>   </p><i class="fa fa-power-off" style="color: red"></i>
                        </p>
                    </span>
                    <span v-if="row.value == 1">
                        <p>   </p><i class="fa fa-warning" style="color:yellow"></i>
                        <p style="color: yellow">
                        </p>
                    </span>
                    <span v-if="row.value == 2">
                        <p>   </p><i class="fa fa-exclamation-circle" style="color:red"></i>
                        <p style="color: red">
                        </p>
                    </span></div>
                </template>
                <template slot="message" slot-scope="row">
                    <span v-if="row.value"> {{ row.value }} </span>
                </template>
                <template slot="lastUpdated" slot-scope="row">
                    <span v-if="row.value"> {{ calLastTime(row.value) }} </span>
                </template>
                <template slot="createdAt" slot-scope="row">
                    <span>{{ row.value | formatDateTime }}</span>
                </template>
                <template slot="enabled" slot-scope="row">
                    <MySwitch
                        class="mb-0"
                        variant="primary"
                        :pill="true"
                        :checked="row.value"
                        v-b-tooltip.hover
                        :title="row.value ? $t('alert.on') : $t('alert.off')"
                        @change="toggleMonitor(row.item)"
                    ></MySwitch>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        class="mr-1 min-width-none"
                        variant="primary"
                        z
                        v-b-tooltip.hover
                        :title="$t('common.edit')"
                        @click="editMonitor(row.item)"
                    >
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button
                        class="mr-1 min-width-none"
                        @click="confirmDelete(row.item)"
                        variant="danger"
                        v-b-tooltip.hover
                        :title="$t('common.delete')"
                    >
                        <i class="fa fa-trash"></i>
                    </b-button>
                    <b-button
                        class="mr-1 min-width-none"
                        variant="info"
                        v-b-tooltip.hover
                        :title="$t('alert.schedule')"
                        @click="openScheduleModal(row.item)"
                    >
                        <i class="fa fa-clock-o"></i>
                    </b-button>
                    <b-button
                        class="mr-1 min-width-none"
                        variant="warning"
                        v-b-tooltip.hover
                        :title="$t('alert.region')"
                        v-b-modal.region-modal
                        @click="openRegionModal(row.item)"
                    >
                        <i class="fa fa-paint-brush"></i>
                    </b-button>
                    <b-button
                        class="mr-1 min-width-none"
                        variant="light"
                        v-b-tooltip.hover
                        :title="$t('alert.attribute')"
                        @click="openParamModal(row.item)"
                    >
                        <i class="fa fa-sliders"></i>
                    </b-button>
                </template>
                <template slot="empty">
                    <div class="text-center">
                        <span>{{ $t('alert.monitorEmpty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > CONSTANTS.ALERT_ITEM_PER_PAGE" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="CONSTANTS.ALERT_ITEM_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>
        <b-modal
            id="monitor-modal"
            :title="form.id ? $t('common.edit') + ' ' + form.name : $t('alert.createAlert')"
            ok-variant="primary"
            :ok-title="`${form.id ? $t('common.update') : $t('common.create')}`"
            :cancel-title="$t('common.cancel')"
            @ok="onSubmit"
            body-class="scroll-modal-body"
        >
            <b-form-group :label="$t('common.name')">
                <b-form-input
                    maxlength="255"
                    v-model="form.name"
                    v-validate="'required'"
                    name="name"
                    :placeholder="$t('common.name')"
                    :data-vv-as="$t('common.name')"
                ></b-form-input>
                <span class="validation-message text-danger">{{ errors.first('name') }}</span>
            </b-form-group>

            <b-form-group :label="$t('alert.type')">
                <b-form-select
                    v-validate="'required'"
                    name="type"
                    v-model="form.type"
                    :data-vv-as="$t('alert.type')"
                >
                    <option :value="undefined">{{ $t('alert.type') }}</option>
                    <option v-for="type in types" :value="type.value" :key="type.value">{{
                        getTypeName(type.value)
                    }}</option>
                </b-form-select>
                <span class="validation-message text-danger">{{ errors.first('type') }}</span>
            </b-form-group>

            <b-form-group :label="$t('alert.camera')">
                <b-form-select
                    v-validate="'required'"
                    name="camera"
                    v-model="form.cameraId"
                    :data-vv-as="$t('alert.camera')"
                >
                    <option :value="undefined">{{ $t('alert.camera') }}</option>
                    <option v-for="camera in cameras" :value="camera.id" :key="camera.id">{{
                        camera.name
                    }}</option>
                </b-form-select>
                <span class="validation-message text-danger">{{ errors.first('camera') }}</span>
            </b-form-group>

            <b-form-group id="server-form" :label="$t('alert.server')" label-for="select-server">
                <b-form-select
                    v-validate="'required'"
                    id="select-server"
                    name="server"
                    v-model="form.serverId"
                    :data-vv-as="$t('alert.server')"
                >
                    <option :value="undefined">{{ $t('alert.server') }}</option>
                    <option v-for="server in servers" :value="server.id" :key="server.id">{{
                        server.name
                    }}</option>
                </b-form-select>
                <span class="validation-message text-danger">{{ errors.first('server') }}</span>
            </b-form-group>

            <b-form-group :label="$t('alert.methods')">
                <b-form-checkbox-group id="action-checkbox" v-model="form.action">
                    <b-form-checkbox
                        v-for="action in actions"
                        :value="action.value"
                        :key="action.value"
                        class="mr-3"
                        >{{ localLang == 'vi' ? action.descVN : action.descEN }}</b-form-checkbox
                    >
                </b-form-checkbox-group>
            </b-form-group>

        </b-modal>
        <b-modal
            id="schedule-modal"
            :title="$t('alert.schedule')"
            no-close-on-esc
            no-close-on-backdrop
            :size="isAdding ? 'lg' : 'xl'"
            :ok-title="isAdding ? $t('common.add') : $t('common.update')"
            :cancel-title="isAdding ? $t('common.back') : $t('common.cancel')"
            @ok="onScheduleOk"
            @cancel="onScheduleCancel"
        >
            <div v-show="!isAdding">
                <b-table striped hover dark :items="form.schedule" :fields="scheduleFields">
                    <template slot="index" slot-scope="data">{{ data.index + 1 }}</template>
                    <template slot="from" slot-scope="row">
                        <span>
                            {{
                                ~~(row.value / 100) +
                                    ':' +
                                    (row.value % 100 < 10
                                        ? (row.value % 100) + '0'
                                        : row.value % 100)
                            }}
                        </span>
                    </template>
                    <template slot="to" slot-scope="row">
                        <span>
                            {{
                                ~~(row.value / 100) +
                                    ':' +
                                    (row.value % 100 < 10
                                        ? (row.value % 100) + '0'
                                        : row.value % 100)
                            }}
                        </span>
                    </template>
                    <template slot="recurrent" slot-scope="row">
                        <span v-if="row.item.weekly">
                            {{ row.item.weekly.map(el => $t(dayCodes[el - 1])).join(', ') }}
                        </span>
                        <span v-else-if="row.item.monthly">{{
                            row.item.monthly.map(el => getRecurrentText(el)).join(', ')
                        }}</span>
                    </template>
                    <template slot="dayoff" slot-scope="row">
                        <span>{{ $t(dayoffArr[row.value]) }}</span>
                    </template>
                    <template slot="weekend" slot-scope="row">
                        <span v-if="row.value">
                            {{ row.value.map(el => $t(dayCodes[el - 1])).join(', ') }}
                        </span>
                    </template>
                    <template slot="delete" slot-scope="row">
                        <b-button
                            size="sm"
                            class="mr-1 min-width-none"
                            @click="deleteSchedule(row.index)"
                            variant="danger"
                            v-b-tooltip.hover
                            :title="$t('common.delete')"
                        >
                            <i class="fa fa-trash"></i>
                        </b-button>
                    </template>
                </b-table>
                <b-row class="d-flex justify-content-center">
                    <b-button variant="outline-primary" size="sm" @click="isAdding = true">
                        <i class="fa fa-plus-circle mr-2"></i>
                        <span>{{ $t('common.add') }}</span>
                    </b-button>
                </b-row>
            </div>
            <div v-show="isAdding">
                <b-row class="mb-1">
                    <b-col md="6">
                        <b-form-group :label="$t('alert.start')">
                            <ScheduleTimePicker
                                v-model="startTime"
                                :maxValue="endTime"
                            ></ScheduleTimePicker>
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <b-form-group :label="$t('alert.end')">
                            <ScheduleTimePicker
                                v-model="endTime"
                                :minValue="startTime"
                            ></ScheduleTimePicker>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-form-group :label="$t('alert.recurrent')">
                    <b-form-radio-group v-model="repeatType">
                        <b-form-radio value="weekly">{{ $t('alert.weekly') }}</b-form-radio>
                        <b-form-radio value="monthly">{{ $t('alert.monthly') }}</b-form-radio>
                    </b-form-radio-group>
                    <b-form-checkbox-group
                        v-if="repeatType === 'weekly'"
                        v-model="checkedDays"
                        id="action-checkbox"
                        class="mt-1"
                    >
                        <b-form-checkbox
                            v-for="(day, index) in dayCodes"
                            :value="index"
                            :key="index"
                            class="mr-3"
                            >{{ $t(day) }}</b-form-checkbox
                        >
                    </b-form-checkbox-group>
                    <MonthTable v-else class="mt-1" v-model="selectedDatesMonthly" />
                </b-form-group>
                <b-form-group :label="$t('alert.dayoff.dayoff')">
                    <b-form-radio-group v-model="dayoff">
                        <b-form-radio
                            v-for="(value, index) in dayoffArr"
                            :key="index"
                            :value="index"
                            >{{ $t(value) }}</b-form-radio
                        >
                    </b-form-radio-group>
                </b-form-group>
                <b-form-group :label="$t('alert.weekend')">
                    <b-form-checkbox-group v-model="weekend" id="action-checkbox" class="mt-1">
                        <b-form-checkbox
                            v-for="(day, index) in dayCodes"
                            :value="index"
                            :key="index"
                            class="mr-3"
                            >{{ $t(day) }}</b-form-checkbox
                        >
                    </b-form-checkbox-group>
                </b-form-group>
            </div>
        </b-modal>
        <b-modal
            id="delete-modal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDeleteMonitor"
            >{{ $t('alert.deleteAlert') }}</b-modal
        >

        <b-modal
            id="param-modal"
            :title="$t('alert.attribute')"
            ok-variant="primary"
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            @ok="changeParams"
            body-class="scroll-modal-body"
            :hide-footer="params.length == 0"
        >
            <b-form-group v-if="params.length == 0">
                <center>
                    <p style="color: white">Không có thông số cần cấu hình</p>
                </center>
            </b-form-group>
            <b-form-group
                label-cols="4"
                v-for="(param, index) in params"
                :key="index"
                :label="localLang === 'en' ? param.textEN : param.textVN"
            >
                <b-form-input
                    v-if="form.params"
                    maxlength="255"
                    v-model="form.params[param.name]"
                    v-validate="'decimal'"
                    :name="'param' + param.name"
                    :placeholder="localLang === 'en' ? param.textEN : param.textVN"
                    :data-vv-as="localLang === 'en' ? param.textEN : param.textVN"
                ></b-form-input>
                <span class="validation-message text-danger">
                    {{ errors.first('param' + param.name) }}
                </span>
            </b-form-group>
        </b-modal>
        <b-modal
            centered
            id="delete-region-modal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="deleteAllRegions"
            >{{ $t('draw.confirmDelete') }}</b-modal
        >
        <b-modal
            size="lg"
            id="region-modal"
            :title="$t('alert.region')"
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            @ok="changeRegions"
        >    
            <div v-show="!loadingImg">
                <b-row class="mx-0 my-2">
                    <b-button class="mr-2" variant="danger" @click="deleteLastObject">
                        <i class="fa fa-trash mr-2"></i>
                        <span>
                            {{ drawing ? $t('draw.deleteLastPoint') : $t('draw.deleteLastRegion') }}
                        </span>
                    </b-button>
                    <b-button class="mr-2" variant="danger" v-b-modal.delete-region-modal>
                        <i class="fa fa-trash mr-2"></i>
                        <span>{{ $t('draw.deleteAllAreas') }}</span>
                    </b-button>
                </b-row>
                <div>
                    <v-stage
                        ref="stage"
                        @click="onStageClick"
                        @mousemove="pointHover"
                        :config="configKonva"
                    >
                        <v-layer>
                            <v-image :config="{ image: image, width: 766, height: 430 }" />
                            <v-line
                                v-for="(item, index) in form.regions"
                                :key="index"
                                :config="{
                                    points: _.flatten(item),
                                    closed: true,
                                    fill: 'red',
                                    stroke: 'rgb(0, 255, 43)',
                                    lineJoin: 'round',
                                    opacity: 0.5
                                }"
                            />
                            <v-line
                                :config="{
                                    points: _.flatten(item.points),
                                    closed: false,
                                    stroke: 'rgb(0, 255, 43)',
                                    opacity: 0.5,
                                    lineJoin: 'round'
                                }"
                            />
                            <v-circle
                                v-for="(point, index) in drawingPoint"
                                :key="'c' + index"
                                :config="{
                                    x: point[0],
                                    y: point[1],
                                    radius: index === hovingPoint ? 10 : 5,
                                    fill: 'orange',
                                    strokeWidth: 4
                                }"
                            />
                        </v-layer>
                    </v-stage>
                </div>
            </div>
            <div
                v-if="loadingImg"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </b-modal>

        <-- Preview model-->
        <b-modal
            size="lg"
            id="region-modal-preview"
            :hide-footer=true
            :hide-header=true
        >    
            <div v-show="!loadingImg">
                <div>
                    <v-stage
                        ref="stage"
                        :config="configKonva"
                    >
                        <v-layer>
                            <v-image :config="{ image: image, width: 766, height: 430 }" />
                            <v-line
                                v-for="(item, index) in form.regions"
                                :key="index"
                                :config="{
                                    points: _.flatten(item),
                                    closed: true,
                                    fill: 'red',
                                    stroke: 'rgb(0, 255, 43)',
                                    lineJoin: 'round',
                                    opacity: 0.5
                                }"
                            />
                            <v-line
                                :config="{
                                    points: _.flatten(item.points),
                                    closed: false,
                                    stroke: 'rgb(0, 255, 43)',
                                    opacity: 0.5,
                                    lineJoin: 'round'
                                }"
                            />
                            <v-circle
                                v-for="(point, index) in drawingPoint"
                                :key="'c' + index"
                                :config="{
                                    x: point[0],
                                    y: point[1],
                                    radius: index === hovingPoint ? 10 : 5,
                                    fill: 'orange',
                                    strokeWidth: 4
                                }"
                            />
                        </v-layer>
                    </v-stage>
                </div>
            </div>
            <div
                v-if="loadingImg"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </b-modal>

    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import MySwitch from '@/components/Switch';
import CONSTANTS from '@/constants';
import changeAlias from '@/utils/changeAlias';
import ScheduleTimePicker from '@/components/ScheduleTimePicker';
import MonthTable from '@/components/MonthTable';
export default {
    components: {
        MySwitch,
        ScheduleTimePicker,
        MonthTable
    },
    mounted: function() {
        this.$nextTick(function() {
            this.setParams([]);
            this.getList({ isFetchFullList: true });
            this.getTypeList();
            this.displayedMonitors();
            this.refreshInterval = setInterval(this.getMonitorReportList, 5000);
            this.getMonitorList();
            this.getMonitorReportList();
            this.getServerList();
            this.getActionList();
            this.image.onload = () => {
                this.loadingImg = false;
                this.width = this.image.width;
                this.height = this.image.height;
                for (const region in this.form.regions) {
                    for (const point in this.form.regions[region]) {
                        const x = this.form.regions[region][point][0];
                        const y = this.form.regions[region][point][1];
                        this.form.regions[region][point][0] = Math.round((x * 766) / this.width);
                        this.form.regions[region][point][1] = Math.round((y * 430) / this.height);
                    }
                }
                if (this.urlCount === 1) {
                    this.urlCount--;
                }
            };
            this.image.onerror = () => {
                if (this.urlCount === 0) {
                    this.image.src = this.selectedCamera.url;
                    this.urlCount++;
                } else {
                    this.image.src = 'static/img/region-background.png';
                    this.$toaster.error(this.$t('draw.getBgfail'));
                    this.$bvModal.hide('region-modal');
                    this.$bvModal.hide('region-modal-preview');
                    this.urlCount--;
                    this.loadingImg = false;
                }
            };
        });
    },
    data: function() {
        return {
            refreshInterval: {},
            viewError: false,
            width: null,
            height: null,
            image: new window.Image(),
            loadingImg: true,
            hovingPoint: null,
            drawingPoint: [],
            item: {
                points: []
            },
            configKonva: {
                width: 766,
                height: 430
            },
            configKonva1: {
                width: 160,
                height: 90
            },
            fields: [
                {
                    class: 'align-middle ',
                    key: 'index',
                    label: '#'
                },
                {
                    tdClass: 'align-middle fixed-actions-col',
                    key: 'imageUrl',
                    label: this.$t('cam.image')
                },
                {
                    class: 'align-middle monitor-name-col',
                    key: 'name',
                    label: this.$t('common.name')
                },
                {
                    class: 'align-middle ',
                    key: 'type',
                    label: this.$t('alert.type')
                },
                {
                    class: 'align-middle ',
                    key: 'cameraId',
                    label: this.$t('alert.camera')
                },
                {
                    class: 'align-middle ',
                    key: 'fps',
                    label: this.$t('alert.fps')
                },
                {
                    class: 'align-middle ',
                    key: 'error',
                    label: this.$t('alert.error')
                },
                {
                    class: 'align-middle monitor-date-col',
                    key: 'message',
                    label: this.$t('alert.moreInfo')
                },
                {
                    class: 'align-middle monitor-date-col',
                    key: 'lastUpdated',
                    label: this.$t('alert.lastUpdated')
                },
                {
                    class: 'align-middle monitor-enable-col',
                    key: 'enabled',
                    label: this.$t('alert.enabled')
                },
                {
                    class: 'align-middle monitor-action-col',
                    key: 'actions',
                    label: this.$t('common.actions')
                }
            ],
            form: {},
            currentMonitor: {},
            isAdding: false,
            startTime: '00:00',
            endTime: '23:59',
            checkedDays: [0, 1, 2, 3, 4, 5, 6],
            dayCodes: [
                'alert.sunday',
                'alert.monday',
                'alert.tuesday',
                'alert.wednesday',
                'alert.thursday',
                'alert.friday',
                'alert.saturday'
            ],
            scheduleFields: [
                { key: 'index', label: '#' },
                { key: 'from', label: this.$t('alert.start') },
                { key: 'to', label: this.$t('alert.end') },
                { key: 'recurrent', label: this.$t('alert.recurrent') },
                { key: 'dayoff', label: this.$t('alert.dayoff.dayoff') },
                { key: 'weekend', label: this.$t('alert.weekend') },
                { key: 'delete', label: this.$t('common.delete') }
            ],
            CONSTANTS,
            currentPage: 1,
            searchKeyword: null,
            selectedCamera: null,
            urlCount: 0,
            repeatType: 'weekly',
            selectedDatesMonthly: [1, 15],
            dayoff: 0,
            weekend: [0, 6],
            dayoffArr: ['alert.dayoff.normal', 'alert.dayoff.skip', 'alert.dayoff.next']
        };
    },
    computed: {
        ...mapState({
            monitorReports: state => state.monitorReport.items,
            cameras: state => state.camera.items,
            types: state => state.monitor.types,
            monitors: state => state.monitor.monitors,
            params: state => state.monitor.params,
            servers: state => state.server.monitorServers,
            actions: state => state.action.actions,
            localLang: state =>
                _.cloneDeep(_.get(state.auth, 'currentUser.userDetail.options.language'))
        }),
        countRow() {
            return this.displayedMonitors.length;
        },
        drawing() {
            return this.item.points.length > 0;
        }
    },
    beforeDestroy() {
        clearInterval(this.refreshInterval);
    },
    methods: {
        ...mapActions({
            getMonitorReportList: 'monitorReport/getMonitorReportList',
            getMonitorList: 'monitor/getMonitorList',
            getList: 'camera/getList',
            getServerList: 'server/getMonitorServerList',
            getTypeList: 'monitor/getMonitorTypeList',
            getActionList: 'action/getActionList',
            createMonitor: 'monitor/createMonitor',
            updateMonitor: 'monitor/updateMonitor',
            deleteMonitor: 'monitor/deleteMonitor',
            getParams: 'monitor/getParams'
        }),
        ...mapMutations({
            setSelectedMontior: 'monitor/SET_SELECTED_MONITOR',
            setParams: 'monitor/SET_PARAMS'
        }),

        editMonitor(data) {
            this.form = JSON.parse(JSON.stringify(data));
            this.$bvModal.show('monitor-modal');
        },
        openAddMonitor() {
            this.form = {
                action: []
            };
        },
        addMonitor() {
            this.form.schedule = [];
            this.form.regions = [];
            this.form.enabled = true;
            this.createMonitor(this.form).then(() => {
                this.$bvModal.hide('monitor-modal');
                this.$toaster.success(this.$i18n.t('alert.createSuccess'));
            });
        },
        modifyMonitor() {
            this.updateMonitor(this.form).then(() => {
                this.$bvModal.hide('monitor-modal');
                this.$toaster.success(this.$i18n.t('alert.updateSuccess'));
            });
        },
        onSubmit(bvModalEvt) {
            bvModalEvt.preventDefault();
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.form.id) {
                        this.modifyMonitor();
                    } else {
                        this.addMonitor();
                    }
                }
            });
        },
        confirmDelete(params) {
            this.currentMonitor = params;
            this.$bvModal.show('delete-modal');
        },
        onDeleteMonitor() {
            this.deleteMonitor(this.currentMonitor).then(() => {
                if (this.countRow / this.CONSTANTS.ALERT_ITEM_PER_PAGE === this.currentPage - 1) {
                    this.currentPage--;
                }
                this.$toaster.success(this.$i18n.t('alert.deleteSuccess'));
            });
        },
        toggleMonitor(monitor) {
            this.form = JSON.parse(JSON.stringify(monitor));
            this.form.enabled = !this.form.enabled;
            this.modifyMonitor();
        },
        openScheduleModal(monitor) {
            this.form = JSON.parse(JSON.stringify(monitor));
            this.$bvModal.show('schedule-modal');
        },
        onScheduleOk(bvModalEvt) {
            if (this.isAdding) {
                bvModalEvt.preventDefault();
                this.form.schedule.push({
                    from: parseInt(this.startTime.replace(':', '')),
                    to: parseInt(this.endTime.replace(':', '')),
                    weekly:
                        this.repeatType === 'weekly' ? this.checkedDays.map(el => el + 1) : null,
                    monthly: this.repeatType === 'monthly' ? this.selectedDatesMonthly : null,
                    dayoff: this.dayoff,
                    weekend: this.weekend.map(el => el + 1)
                });
                this.isAdding = false;
            } else {
                bvModalEvt.preventDefault();
                this.updateMonitor(this.form).then(() => {
                    this.$bvModal.hide('schedule-modal');
                    this.$toaster.success(this.$i18n.t('alert.updateSuccess'));
                });
            }
        },

        onScheduleCancel(bvModalEvt) {
            if (this.isAdding) {
                bvModalEvt.preventDefault();
                this.isAdding = false;
            }
        },
        deleteSchedule(index) {
            this.form.schedule.splice(index, 1);
        },
        openParamModal(monitor) {
            this.getParams({ id: monitor.type });
            this.form = JSON.parse(JSON.stringify(monitor));
            if (!this.form.params) {
                this.form.params = {};
            }
            this.$bvModal.show('param-modal');
        },
        changeParams(bvModalEvt) {
            bvModalEvt.preventDefault();
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.form.activeInterval = parseInt(this.form.activeInterval);
                    this.form.inactiveInterval = parseInt(this.form.inactiveInterval);
                    for (const param in this.form.params) {
                        if (isNaN(parseFloat(this.form.params[param]))) {
                            delete this.form.params[param];
                        } else {
                            this.form.params[param] = parseFloat(this.form.params[param]);
                        }
                    }
                    this.updateMonitor(this.form).then(() => {
                        this.$bvModal.hide('param-modal');
                        this.$toaster.success(this.$i18n.t('alert.updateSuccess'));
                    });
                }
            });
        },
        getTypeName(value) {
            const type = this.types.find(el => el.value === value);
            if (type) {
                if (this.localLang === 'en') return type.descEN;
                return type.descVN;
            }
        },
        getCameraName(value) {
            const camera = this.cameras.find(el => el.id === value);
            if (camera) return camera.name;
        },
        ifRun(value) {
            const fps = this.monitors.find(el => el.error === value);
            if (fps) {
                return true;
            } else return false;
        },
        getCameraFps(value) {
            const monitorReport = this.monitorReports.find(el => el.monitorId === value);
            if (monitorReport) return monitorReport.fps;
        },
        getCameraError(value) {
            const monitorReport = this.monitorReports.find(el => el.monitorId === value);
            if (monitorReport) return monitorReport.error;
        },
        pointHover(index) {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            if (this.drawing) {
                if (this.calcDistance([mousePos.x, mousePos.y], this.item.points[0]) < 100) {
                    this.hovingPoint = 0;
                } else {
                    this.hovingPoint = null;
                }
            }
        },
        onStageClick(event) {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            if (
                this.drawing &&
                this.calcDistance([mousePos.x, mousePos.y], this.item.points[0]) < 100
            ) {
                this.draw();
            } else {
                this.item.points.push([mousePos.x, mousePos.y]);
                this.drawingPoint.push([mousePos.x, mousePos.y]);
            }
        },
        calcDistance(point1, point2) {
            return (
                (point1[0] - point2[0]) * (point1[0] - point2[0]) +
                (point1[1] - point2[1]) * (point1[1] - point2[1])
            );
        },
        cancelDraw() {
            this.item.points = [];
            this.drawingPoint = [];
        },
        draw() {
            this.form.regions.push(this.item.points);
            this.drawingPoint = [];
            this.item.points = [];
        },
        deleteLastObject() {
            if (this.drawing) {
                this.item.points.pop();
                this.drawingPoint.pop();
            } else {
                this.form.regions.pop();
            }
        },
        deleteAllRegions() {
            this.item.points = [];
            this.drawingPoint = [];
            this.form.regions = [];
        },
        getBgImg() {
            this.loadingImg = true;
            const camera = this.cameras.find(el => el.id === this.form.cameraId);
            if (camera) {
                this.selectedCamera = camera;
                this.image.src = camera.liveUrl ? camera.liveUrl : camera.url;
            }
        },
        openRegionModal(monitor) {
            this.item.points = [];
            this.drawingPoint = [];
            this.form = JSON.parse(JSON.stringify(monitor));

            this.getBgImg();
        },
        openRegionModalPreview(monitor) {
            this.item.points = [];
            this.drawingPoint = [];
            this.form = JSON.parse(JSON.stringify(monitor));

            this.getBgImg();
        },
        changeRegions(bvModalEvt) {
            bvModalEvt.preventDefault();
            for (const region in this.form.regions) {
                for (const point in this.form.regions[region]) {
                    const x = this.form.regions[region][point][0];
                    const y = this.form.regions[region][point][1];

                    this.form.regions[region][point][0] = Math.round((x * this.width) / 766);
                    this.form.regions[region][point][1] = Math.round((y * this.height) / 430);
                }
            }
            this.updateMonitor(this.form).then(() => {
                this.$bvModal.hide('region-modal');
                this.$bvModal.hide('region-modal-preview');
                this.$toaster.success(this.$i18n.t('alert.updateSuccess'));
            });
        },
        getRecurrentText(value) {
            if (this.localLang === 'vi') {
                return this.$t('alert.date') + ' ' + value;
            } else {
                let extension = 'th';
                // Examine the last 2 digits.
                const lastDigits = value % 100;
                // If the last digits are 11, 12, or 13, use th. Otherwise:
                if (lastDigits < 11 || lastDigits > 13) {
                    // Check the last digit.
                    switch (lastDigits % 10) {
                        case 1:
                            extension = 'st';
                            break;
                        case 2:
                            extension = 'nd';
                            break;
                        case 3:
                            extension = 'rd';
                            break;
                    }
                }
                return value + extension;
            }
        },
        openErrorModal: async function() {
            this.$refs.errorModal.show();
        },
        displayedMonitors: function() {
            if (this.searchKeyword) {
                return this.monitors.filter(monitor => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const monitorName = changeAlias(monitor.name.toLowerCase());
                    return monitorName.indexOf(keyword) > -1;
                });
            }
            this.monitors.map(monitor => {
                const camera = this.cameras.find(item => item.id === monitor.cameraId);
                if (camera) monitor.imageUrl = camera.imageUrl;
                const monitorReport = this.monitorReports.find(
                    item => item.monitorId === monitor.id
                );
                if (monitorReport) {
                    monitor.fps = monitorReport.fps.toFixed(2);
                    monitor.error = monitorReport.error;
                    monitor.lastUpdated = monitorReport.updatedAt;
                    if (this.calTime(monitor.lastUpdated) > 300) {
                        monitor.message = 'Không chạy';
                        monitor.error = undefined;
                        monitor.fps = undefined;
                    } else {
                        if (!monitorReport.message) {
                            monitor.message = 'Bình thường';
                        } else {
                            monitor.message = monitorReport.message;
                        }
                    }
                } else {
                    monitor.message = 'Không chạy';
                }
                return monitor;
            });
            return this.monitors;
        },
        calLastTime(value) {
            var date = new Date(value);
            var seconds = date.getTime() / 1000;
            var agoSeconds = Date.now() / 1000 - seconds;
            if (agoSeconds > 600) {
                return '';
            } else {
                return Math.floor(agoSeconds / 60) + ' Phút ' + (agoSeconds % 60).toFixed(0) + ' giây trước';
            }
        },
        calTime(value) {
            var date = new Date(value);
            var seconds = date.getTime() / 1000;
            var agoSeconds = Date.now() / 1000 - seconds;
            return agoSeconds.toFixed(0);
        },
        rePoint(value) {
            var result = [[[]]];
            for (var i = 0; i < value.length; i++) {
                var result2 = [[]];
                for (var j = 0; j < value[i].length; j++) {
                    var result3 = [];
                    result3.push(Math.round(value[i][j][0] * 160 / 1280));
                    result3.push(Math.round(value[i][j][1] * 90 / 720));
                    result2.push(result3);
                }
                result.push(result2);
            }
            return result;
        }
    }
};
</script>
<style>
.monitor-action-col {
    width: 250px;
}
.monitor-date-col {
    width: 135px;
}
.monitor-enable-col {
    width: 90px;
    text-align: center;
}
.scroll-modal-body {
    max-height: 70vh;
    overflow: auto;
}
</style>
