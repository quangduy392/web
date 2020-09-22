<template>
    <div class="h-100">
        <b-row>
            <b-col cols="2" v-for="template in templates" :key="template.id" class="mb-4">
                <div
                    class="add-video_video-item cursor-pointer border rounded mb-2"
                    :class="{
                        'add-video_video-item_active border-success': isSelectedTemplate(
                            template.id
                        )
                    }"
                    @click="toggleSelectTemplate(template)"
                >
                    <div
                        class="report-template-image ratio-16-9 text-center position-relative rounded"
                        :style="{
                            'background-image': `url(${template.image})`
                        }"
                    />
                    <i
                        class="fa fa-3x fa-check text-success add-video_video-item_active-icon"
                        aria-hidden="true"
                    ></i>
                </div>
                {{ template.name }}
            </b-col>
        </b-row>

        <div
            v-if="isShowLoading"
            class="h-100 d-flex flex-column justify-content-center align-items-center"
        >
            <img src="/static/img/loader-green.gif" class="standalone-loading" />
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    name: 'choose-template',
    components: {},
    mounted: function() {
        this.$nextTick(async function() {
            this.isShowLoading = true;
            await this.getTemplateList();
            this.isShowLoading = false;
        });
    },
    computed: {
        ...mapState({
            templates: state => state.report.listTemplate
        })
    },
    data() {
        return {
            selectedTemplates: [],
            isShowLoading: false,
            listTemplate: []
        };
    },
    methods: {
        ...mapActions({
            getTemplateList: 'report/getListTemplate'
        }),
        isSelectedTemplate(templateId) {
            return this.selectedTemplates.find(template => template.id === templateId);
        },
        toggleSelectTemplate(template) {
            if (this.isSelectedTemplate(template.id)) {
                const removedIndex = this.selectedTemplates.findIndex(v => v.id === template.id);
                this.selectedTemplates.splice(removedIndex, 1);
            } else {
                this.selectedTemplates = [template];
            }

            this.$emit('updateSelectedTemplates', this.selectedTemplates);
        }
    }
};
</script>
<style scoped>
.report-template-image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    overflow: hidden;
}
</style>