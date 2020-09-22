<template>
    <date-picker
        class="w-100"
        :value="value"
        format="HH:mm"
        inputClass="form-control bg-white"
        popupClass="timepicker-popup"
        type="time"
        value-type="format"
        :editable="false"
        :clearable="false"
        :disabledTime="disabledTime"
        @input="e => $emit('input',e)"
    >
        <span slot="icon-calendar"></span>
    </date-picker>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
    components: {
        DatePicker
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        minValue: {
            type: String,
            default: null
        },
        maxValue: {
            type: String,
            default: null
        }
    },

    methods: {
        disabledTime(time) {
            let checkMin = false;
            let checkMax = false;
            if (this.minValue) {
                const minValueHours = this.$moment(this.minValue, 'HH:mm').hour();
                const minValueMinutes = this.$moment(this.minValue, 'HH:mm').minute();
                checkMin =
                    time.getHours() < minValueHours ||
                    (time.getHours() === minValueHours && time.getMinutes() <= minValueMinutes);
            }
            if (this.maxValue) {
                const maxValueHours = this.$moment(this.maxValue, 'HH:mm').hour();
                const maxValueMinutes = this.$moment(this.maxValue, 'HH:mm').minute();
                checkMax =
                    time.getHours() > maxValueHours ||
                    (time.getHours() === maxValueHours && time.getMinutes() >= maxValueMinutes);
            }
            return checkMin || checkMax;
        }
    }
};
</script>

<style>
.timepicker-popup {
    z-index: 9999 !important;
}
</style>