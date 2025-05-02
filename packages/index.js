import "./MrCalendar/style/reset.scss";

import MrCalendarCenter, {MrCalendar} from './MrCalendar'
const components = [MrCalendarCenter, MrCalendar];
const install = function(Vue) {
  if (install.installed) return
  components.map(component => Vue.component(component.name, component))
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  ...components
}
