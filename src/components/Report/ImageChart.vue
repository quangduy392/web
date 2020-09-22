<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title + ' ' + caseVideos[0].video.name }}</h5>
        <div class="ratio-16-9 position-relative" v-if="isShowVisualLayerLoading">
            <div class="obsolute-full d-flex flex-column justify-content-center align-items-center">
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </div>
        <b-img
            :src="visualLayerImageUrl"
            class="w-100"
            v-if="!isShowVisualLayerLoading && visualLayerImageUrl"
            style="height: 200px;"
        ></b-img>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
export default {
    props: {
        input: Object,
        caseVideos: Array
    },
    name: 'image-chart',
    data() {
        return {
            visualLayerImageUrl: '',
            isShowVisualLayerLoading: true
        };
    },
    components: {},
    methods: {
        ...mapActions({
            getServerDetail: 'server/getDetail',
            getVideoHeatMapImage: 'video/getHeatMapImage'
        })
    },
    async mounted() {
        const server = await this.getServerDetail({
            endpointSubfix: this.input.caseVideo.video.serverId
        });
        this.getVideoHeatMapImage({
            server: server,
            data: {
                videoId: this.input.caseVideo.videoId,
                type: 'acivity'
            }
        }).then(response => {
            const bytes = new Uint8Array(response);
            const binary = bytes.reduce((data, b) => (data += String.fromCharCode(b)), '');
            this.visualLayerImageUrl = 'data:image/jpeg;base64,' + btoa(binary);
            this.isShowVisualLayerLoading = false;
        });
    }
};
</script>

<style lang="css">
</style>
