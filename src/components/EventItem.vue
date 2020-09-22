<template>
    <div
        :class="[
            'd-flex justify-content-center align-items-center border position-relative ratio-16-9',
            !event.level
                ? 'border-gray-500'
                : event.level === 1
                ? 'border-success'
                : event.level === 2
                ? 'border-warning'
                : 'border-danger'
        ]"
        @mouseover="mouseHoving = true"
        @mouseleave="mouseHoving = false"
    >
        <b-img :src="getUrl()" class="obsolute-full"></b-img>
        <div style="position: absolute; bottom: 3px" class="event-text-color text-center">
            <div>{{ getCameraName(event.cameraId) }}</div>
            <div>{{ display(event.createdAt) }}</div>
        </div>
        <span
            style="position: absolute; top: 3px; max-width: 46%"
            class="event-text-color text-center"
        >{{ event }}</span>
        <span
            style="position: absolute; top: 26px;"
            class="event-text-color text-center"
            v-if="event.group"
        >{{ event.group }}</span>
        <img
            style="position: absolute; top:5px; right: 5px;"
            class="border border-dark"
            height="55%"
            v-if="event.image"
            :src="BASE_URL + event.image.replace(/\/api/g, '')"
        />
        <img
            style="position: absolute; top:4px; left: 5px;"
            height="19px"
            :src="`static/icon/event/${event.type}.svg`"
            v-b-tooltip.hover
            :title="getTypeName(event.type)"
        />
        <span
            v-if="!hideTools"
            style="position: absolute; bottom:4px; left: 5px"
            class="text-center"
            v-b-tooltip.hover
            :title="$t('common.select')"
            v-show="isSelected ? true : mouseHoving"
            @click="toggleSelected"
        >
            <i
                :class="[
                    'cursor-pointer',
                    isSelected ? 'fa fa-lg fa-check-circle text-success' : 'fa fa-lg fa-circle-o'
                ]"
            ></i>
        </span>
        <span
            v-if="!hideTools"
            style="position: absolute; bottom:4px; right: 5px"
            class="text-center"
            v-show="event.reviewer ? true : mouseHoving"
            v-b-modal.modal-review
            v-b-tooltip.hover
            :title="$t('alert.review')"
            @click="reviewEvent"
        >
            <i :class="['fa fa-lg fa-wrench cursor-pointer', event.reviewer ? 'text-primary' : '']"></i>
        </span>
        <span
            v-if="!hideTools"
            v-show="event.bookmarked ? true : mouseHoving"
            style="position: absolute; top: 3px; right: 5px"
            class="text-center"
            v-b-tooltip.hover
            :title="!event.bookmarked ? $t('alert.bookmark') : $t('alert.deleteBookmark')"
            @click="bookmarkEvent"
        >
            <i
                :class="[
                    'fa fa-lg cursor-pointer',
                    event.bookmarked ? 'fa-star text-warning' : 'fa-star-o'
                ]"
            ></i>
        </span>
        <h1
            class="position-absolute cursor-pointer"
            v-show="mouseHoving"
            @click="changeVideo"
            v-b-modal.modal-video
            style="top: 50%; margin: -16px 0px 0px;"
        >
            <i class="fa fa-play-circle"></i>
        </h1>
    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import API_CONFIG from '@/api-config';

export default {
    props: {
        hideTools: {
            type: Boolean,
            default: false
        },
        event: {
            type: Object
        }
    },
    components: {},
    mounted: function() {
        this.$nextTick(async () => {
            if (this.event.profileId) {
                this.event.group = await this.getGroupName(this.event.profileId);
            }
        });
    },
    data: function() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            mouseHoving: false
        };
    },
    computed: {
        ...mapState({
            selectedEventList: state => state.event.selectedEventList,
            cameras: state => state.camera.items,
            types: state => state.event.types
        }),
        isSelected() {
            return this.selectedEventList.findIndex(el => el.id === this.event.id) !== -1;
        }
    },
    methods: {
        ...mapActions({
            updateEvent: 'event/updateEvent',
            getProfile: 'profile/getProfile'
        }),
        ...mapMutations({
            addSelectedEvent: 'event/ADD_SELECTED_EVENT',
            unselectEvent: 'event/UNSELECT_EVENT'
        }),
        changeVideo() {
            this.$emit('changeVideo', this.event);
        },
        getUrl() {
            return `${API_CONFIG.BASE_URL}event-image/${this.event.id}/snapshot.jpg`;
        },
        display(date) {
            if (this.$moment(date).isSame(this.$moment(), 'day')) {
                return this.$moment(date).format('HH:mm:ss');
            }
            if (this.$moment(date).isSame(this.$moment(), 'year')) {
                return this.$moment(date).format('DD/MM - HH:mm:ss');
            }
            return this.$moment(date).format('DD/MM/YY');
        },
        toggleSelected() {
            if (this.isSelected) {
                this.unselectEvent(this.event);
            } else {
                this.addSelectedEvent(this.event);
            }
        },
        reviewEvent() {
            this.$emit('reviewEvent', this.event);
        },
        bookmarkEvent() {
            const tmp = { ...this.event };
            if (!tmp.bookmarked) {
                tmp.bookmarked = true;
                this.updateEvent(tmp).then(() => {
                    if (tmp.bookmarked === true) {
                        this.$toaster.success(this.$t('alert.bookmarkSuccess'));
                    } else {
                        this.$toaster.success(this.$i18n.t('alert.deleteBookmarkSuccess'));
                    }
                });
            } else {
                tmp.bookmarked = false;
                this.$emit('bookmarkDeleted', tmp);
            }
        },
        getTypeName(value) {
            const type = this.types.find(el => el.value === value);
            if (type) {
                if (this.localLang === 'en') return type.descEN;
                return type.descVN;
            }
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        async getGroupName(profileId) {
            const { group } = await this.getProfile({ id: profileId });
            return group;
        }
    }
};
</script>
<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
</style>
