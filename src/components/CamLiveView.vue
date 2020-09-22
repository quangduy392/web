<template>
    <div class="ratio-16-9 position-relative border border-gray-500">
        <div class="obsolute-full overflow-hidden" v-if="camera.liveUrl">
            <b-img :src="camera.liveUrl" class="w-100"></b-img>

            <i
                @click="() => openVideoModal(camera.liveUrl)"
                class="icon-size-fullscreen icons font-2xl"
                style="position: absolute; bottom: 10px; right: 10px; font-weight: bold; cursor: pointer;"
            ></i>
        </div>

        <div
            v-if="!camera.liveUrl"
            class="obsolute-full d-flex justify-content-center align-items-center text-muted"
        >{{$i18n.t('attendanceCamera.noVideo')}}</div>

        <div
            v-if="camera.name"
            class="position-absolute"
            style="top: 0; right: 0; background: rgba(0, 0, 0, 0.6); padding: 6px 10px;"
        >{{camera.name}}</div>

        <!-- video modal -->
        <b-modal
            ref="videoModal"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="border border-gray-500 p-0"
        >
            <div class="ratio-16-9 position-relative">
                <div
                    class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
                <div class="obsolute-full overflow-hidden">
                    <b-img :src="modalVideoUrl" class="w-100"></b-img>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: 'cam-live-view',
    props: {
        camera: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            modalVideoUrl: null
        };
    },
    methods: {
        openVideoModal(modalVideoUrl) {
            this.modalVideoUrl = modalVideoUrl;
            this.$refs.videoModal.show();
        }
    }
};
</script>

<style lang="scss" scoped>
</style>