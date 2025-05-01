<template>
    <div class="body">
        <vue-hash-calendar
                :visible="true"
                @touchstart="touchStart"
                @touchmove="touchMove"
                @slidechange="slideChange"
                @touchend="touchEnd">
        </vue-hash-calendar>
    </div>
</template>

<script>

export default {
  name: 'TouchDemo',
  components: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {
    touchStart(event) { // 监听手指开始滑动事件
      console.log(event, 'start')
    },
    touchMove(event) { // 监听手指开始滑动事件
      console.log(event, 'move')
    },
    touchEnd(event) { // 监听手指开始滑动事件
      console.log(event, 'end')
    },
    slideChange(direction) { // 滑动方向改变
      console.log(direction, 'direction')
    }
  }
}
</script>

<style lang="stylus">
    @import "./style/reset.styl"

</style>
