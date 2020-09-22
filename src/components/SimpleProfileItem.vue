<template>
    <div class="border">
        <div
            :class="['case-video-thumbnail ratio-3-4 text-center position-relative', disabled?'':'cursor-pointer']"
            :style="{'background-image': `url(${avatar})`}"
            @click="toggleSelect"
        >
            <div class="text-ellipsis" v-if="!disabled">
                <span :class="manager?'manager-color':'event-text-color'">{{ profile.group }}</span>
            </div>
            <div style="position:absolute; top:0px; left:0;width: 100%;" class="text-ellipsis">
                <span :class="manager?'manager-color':'event-text-color'">{{ profile.name }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import API_CONFIG from '../api-config';
import { mapState } from 'vuex';

export default {
    props: ['profile', 'disabled', 'manager'],
    computed: {
        ...mapState({
            listAllImages: state => state.profile.listAllImages
        }),
        avatar() {
            return (
                API_CONFIG.BASE_URL +
                this._.get(API_CONFIG, 'profile.profilePortraitImage').replace(
                    /:id/g,
                    this.profile.id
                )
            );
        }
    },
    methods: {
        toggleSelect() {
            this.$emit('change', this.profile);
        }
    }
};
</script>
<style scoped>
.manager-color {
    color: #ffed37;
    background-color: rgba(0, 0, 0, 0.6);
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.text-ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>