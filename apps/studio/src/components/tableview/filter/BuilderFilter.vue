<template>
  <div class="filter-container">
    <div class="select-wrap field-select-wrap">
      <v-select
        v-model="filter.field"
        :options="columnNames"
        :clearable="false"
        :components="{ OpenIndicator }"
        :title="filter.field"
        :input-id="`filter-field-${index}`"
        append-to-body
        class="dropdown-search form-control field-select"
      />
    </div>
    <div class="select-wrap">
      <select
        name="Filter Type"
        class="form-control"
        v-model="filter.type"
        @change="maybeClearValue()"
      >
        <option
          v-for="{ value, label } in filterTypes"
          :key="value"
          :value="value"
        >
          {{ label }}
        </option>
      </select>
    </div>
    <div class="expand filter">
      <div class="filter-wrap">
        <input
          class="form-control filter-value"
          :class="{ 'disabled-input': isNullFilter }"
          type="text"
          ref="filterInputs"
          v-model="filter.value"
          @blur="$emit('blur')"
          :disabled="isNullFilter"
          :title="isNullFilter ?
            'You cannot provide a comparison value when checking for NULL or NOT NULL' :
            ''"
          :placeholder="
            isListInput
              ? `Enter values separated by comma, eg: foo,bar`
              : 'Enter Value'
          "
        >
        <button
          v-if="!isNullFilter"
          type="button"
          class="clear"
          @click.prevent="$set(filter, 'value', '')"
        >
          <i class="material-icons">cancel</i>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import { TableFilterSymbols } from '@/lib/db/types';
import { isListFilter } from '@/common/utils';
import {mapState} from 'vuex'
import vSelect from 'vue-select'

export default {
  props: ['filter', 'columns', 'index'],
  components: { vSelect },
  data: () => ({
    OpenIndicator: {
      render: createElement => createElement('i', { class: { 'material-icons': true } }, 'arrow_drop_down')
    }
  }),
  watch: {
    filter: {
      deep: true,
      handler() {
        this.$emit('changed', this.index, this.filter)
      }
    }
  },
  computed: {
    ...mapState(['supportedFeatures']),
    columnNames() {
      return (this.columns ?? []).map((column) => column.columnName)
    },
    filterTypes() {
      const filterTypes = this.supportedFeatures.filterTypes ?? ['standard']
      
      return TableFilterSymbols.filter(tf => filterTypes.includes(tf.type))
    },
    isListInput() {
      return isListFilter(this.filter.type)
    },
    isNullFilter() {
      const typeOptions = this.filterTypes.find((f) => f.value === this.filter.type)
      return !!typeOptions.nullOnly
    }
  },
  methods: {
    maybeClearValue() {
      if (this.isNullFilter) {
        this.$set(this.filter, 'value', null)
      }
    },
  }
}

</script>
