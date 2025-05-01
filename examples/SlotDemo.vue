<template>
  <div class="body">
    <button @click="showCalendarDialog">显示</button>
    <vue-hash-calendar ref="picker"
                       :visible.sync="isShowCalendar"
                       :mark-date="markDate"
                       picker-type="date">
      <div slot="day" slot-scope="scope">
        <div>{{scope.date.day}}</div>
        <div v-if="scope.extendAttr.isMarked">标记</div>
      </div>
    </vue-hash-calendar>
  </div>
</template>

<script>

export default {
  name: 'demo',
  components: {},
  data() {
    return {
      isShowCalendar: true, // 是否显示弹窗
      isShowTips: false, // 是否显示下载提示
      defaultDatetime: new Date(),
      markDate: [
        '2025/05/24', '2025/05/22',
        { color: 'red', date: ['0', '2025/02/25', '2025/03/25', '2025/04/01', '2025/05/25', '2025/06/25', '2025/07/25', '2025/08/25', '2025/09/25', '2025/10/25', '2025/05/25', '2025/12/25'] },
        { color: 'blue', date: ['2025/01/20', '2025/02/20', '2025/03/20', '2025/04/20', '2025/05/20', '2025/06/20', '2025/07/20', '2025/08/20', '2025/09/20', '2025/10/20', '2025/05/20', '2025/12/20'] },
        { color: 'pink', date: ['2025/01/12', '2025/02/12', '2025/03/12', '2025/04/12', '2025/05/12', '2025/06/12', '2025/07/12', '2025/08/12', '2025/09/12', '2025/10/12', '2025/05/12', '2025/12/12'] },
        { color: '#000000', date: ['2025/01/29', '2025/02/29', '2025/03/29', '2025/04/29', '2025/05/29', '2025/06/29', '2025/07/29', '2025/08/29', '2025/09/29', '2025/10/29', '2025/05/29', '2025/12/29'] }
      ] // 对象数组形式的标记日期，可以自定义标记颜色
    }
  },
  mounted() {
    //            this.defaultDatetime = new Date('2018-01-01 12:04');
  },
  methods: {
    showCalendarDialog() { // 显示日历
      this.isShowCalendar = true
    },
    dateChange(date) { // 日期改变触发
      console.log(date, 'change')
    },
    dateConfirm(date) { // 点击确认按钮触发
      console.log(date, 'confirm')
    },
    dateClick(date) { // 点击日期时按钮触发
      console.log(date, 'click')
    },
    disabledDate(date) { // 禁用的日期
      let timestamp = date.getTime()
      let oneDay = 24 * 60 * 60 * 1000

      if (timestamp < new Date().getTime() - oneDay) {
        return true
      }
      return false
    }
  }
}
</script>
<style lang="stylus">
.hhhh
  background red
</style>