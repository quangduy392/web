<template>
    <date-picker
        class="w-100"
        v-model="valueData"
        :format="getDateTimeFormat()"
        lang="en"
        input-class="form-control bg-white"
        :editable="false"
        :not-before="minDateTime"
        :not-after="maxDateTime"
        :type="type"
        :minute-step="minuteStep"
        :clearable="clearable"
        :confirm="confirm"
        @input="updateValue"
    ></date-picker>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import { formatServerTime } from '../filters/datetime';
import moment from 'moment-timezone';

export default {
    components: {
        DatePicker
    },
    props: {
        minDateTime: {
            type: Object | String,
            default: null
        },
        maxDateTime: {
            type: Object | String,
            default: null
        },
        type: {
            type: String,
            default: 'date'
        },
        clearable: {
            type: Boolean,
            default: true
        },
        confirm: {
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
            minuteStep: 1
        };
    },
    watch: {
        value(val) {
            this.valueData = val ? moment(val) : null;
            this.updateValue();
        }
    },
    methods: {
        updateValue() {
            const formattedVal = formatServerTime(this.valueData, this.getDateTimeFormat());
            this.$emit('updateValue', formattedVal);
            this.$emit('input', formattedVal); // Update v-model
        },
        getDateTimeFormat() {
            switch (this.type) {
                case 'date':
                    return 'DD/MM/YYYY';
                case 'datetime':
                    return 'DD/MM/YYYY HH:mm';
                default:
                    return 'DD/MM/YYYY';
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
