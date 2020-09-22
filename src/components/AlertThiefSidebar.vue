<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto d-flex flex-column report-filter-sidebar_filter-container"
        >
            <div class="flex-1 overflow-y-auto h-100">
                <b-table
                    v-if="items.length"
                    dark
                    :items="items"
                    :fields="fields"
                    class="mb-0"
                    select-mode="single"
                    selected-variant="active"
                    @row-selected="onZoneSelected"
                    selectable
                >
                    <template slot="cameraId" slot-scope="data">
                        <NewestFaceItem :event="data.item" />
                        <div>{{ getZoneName(data.item.cameraId) }}</div>
                    </template>
                </b-table>

                <!-- event list -->
                <div
                    v-if="profileSelected&&!items.length"
                    class="h-100 d-flex flex-column justify-content-center align-items-center text-muted"
                >{{ $i18n.t('attendanceCamera.noData') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import _ from 'lodash';
import NewestFaceItem from '@/components/NewestFaceItem';

export default {
    name: 'attendance-welcome-sidebar',
    components: { NewestFaceItem },
    props: {
        eventNewest: {
            type: Array,
            default: []
        },
        zones: {
            type: Array,
            default: []
        }
    },
    mounted: function() {
        this.$nextTick(async function() {
            this.zoneCamera = await this.getListZoneCamera();
        });
    },
    data() {
        return {
            profileSelected: null,
            fields: [
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'cameraId'
                }
            ],
            zoneCamera: []
        };
    },
    computed: {
        items() {
            return _.sortBy(_.uniqBy(this.eventNewest, 'profileId'), 'createdAt').reverse();
        }
    },
    methods: {
        ...mapActions({
            getListZoneCamera: 'zone/getListZoneCamera'
        }),
        getZoneName(cameraId) {
            for (const zoneCam of this.zoneCamera) {
                if (zoneCam.cameraId === cameraId) {
                    const zone = _.find(this.zones, { id: zoneCam.zoneId });
                    if (zone) return zone.name;
                }
            }
            return 'Không xác định';
        },
        onZoneSelected(items) {
            if (items.length === 0) return;
            for (const zoneCam of this.zoneCamera) {
                if (zoneCam.cameraId === items[0].cameraId) {
                    const zone = _.find(this.zones, { id: zoneCam.zoneId });
                    if (zone) {
                        return this.$emit('zoneSelectedChange', zone);
                    }
                }
            }
        }
    }
};
</script>