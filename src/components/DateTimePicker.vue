<template>
    <VueCtkDateTimePicker
        v-model="valueData"
        no-label
        :noClearButton="!showClearBtn"
        noHeader
        :error="required && !value"
        :label="$t('cases.ctkDateTimePickerLabel')"
        format="DD/MM/YYYY HH:mm"
        formatted="DD/MM/YYYY HH:mm"
        no-button
        @formatted-value="updateValue"
        @input="onInput"
    />
</template>

<script>
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import moment from 'moment';
import { formatServerTime } from '../filters/datetime';

export default {
    components: {
        VueCtkDateTimePicker
    },
    props: {
        required: {
            type: Boolean,
            default: false
        },
        showClearBtn: {
            type: Boolean,
            default: false
        },
        // v-model
        value: {
            type: Object | String,
            default: null
        }
    },
    data() {
        return {
            valueData: this.value ? moment(this.value) : null,
            minDate: null,
            maxDate: null
        };
    },
    watch: {
        value(val) {
            this.valueData = val ? moment(val) : null;
        }
    },
    methods: {
        updateValue() {
            const formattedVal = formatServerTime(this.valueData, 'DD/MM/YYYY HH:mm');
            this.$emit('updateValue', formattedVal);
            this.$emit('input', formattedVal); // Update v-model
        },
        onInput(value) {
            this.$emit('dateInput', value);
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
