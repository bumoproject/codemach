<template>
  <div class="edit-content">
    <div class="content-first">
      <el-tabs class="edit-main-content" :value="activeFile" @input="checkTab" type="card" closable @tab-remove="removeTab">
        <el-tab-pane
          v-for="(item, index) in fileTab"
          :key="index"
          :label="item.title"
          :name="item.path"
        >
          <editor ref="aceEditor"
            :value="item.content"
            @input="editing(item.path, index)"
            :path="item.path"
            @init="editorInit"
            lang="javascript"
            theme="solarized_dark"
            :options="editorOptions"
            width="100%"
            height="100%"></editor>
        </el-tab-pane>
      </el-tabs>
      <div class="edit-bottom-status clearfix">
        <a href="javascript:;" title="Clear" class="el-icon-delete fl" @click="clearConsole"></a>
        <span class="current-column fr">Column {{activeEnvironment.editorStatus.column}}</span>
        <span class="current-row fr">Row {{activeEnvironment.editorStatus.row}}</span>
      </div>
    </div>
    <div ref="splitLine" class="content-split" v-drag="$refs.aceEditor" style="top: 80%;"></div>
    <Console></Console>
  </div>
</template>

<script>
/**
 * Editor Configure
 * vue2-ace-editor https://github.com/chairuosen/vue2-ace-editor
 * Configuring Ace https://github.com/ajaxorg/ace/wiki/Configuring-Ace
 */
import Console from './Console'
import { mapGetters } from 'vuex'
import drag from '../../assets/js/drag.js'
import editor from 'vue2-ace-editor'
export default {
  name: 'Edit',
  components: {Console, editor},
  directives: {
    drag: {
      componentUpdated: (el, binding) => {
        drag(el, {}, binding.value)
      }
    }
  },
  data () {
    return {
      tabIndex: 1,
      editorOptions: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        highlightActiveLine: false,
        highlightGutterLine: true,
        showPrintMargin: false,
        fontSize: 14,
        tabSize: 2,
        firstLineNumber: 0
      },
      editorRisize: 1
    }
  },
  mounted () {
    // console.log(this.$refs.aceEditor[0].editor)
    for (var i = 0; i < this.$refs.aceEditor.length; i++) {
      this.$refs.aceEditor[i].editor.resize()
    }
  },
  created () {},
  computed: {
    ...mapGetters([
      'activeFile',
      'fileTab',
      'environment',
      'environmentType',
      'activeEnvironment',
      'editorState'
    ])
  },
  methods: {
    setCompletions (editor, session, pos, prefix, callback) {
      let wordList = ['test111']
      callback(null, wordList.map(function (word) {
        return {
          caption: word,
          value: word,
          name: 'test',
          meta: 'test',
          type: 'local',
          score: 1000 // 让test排在最上面
        }
      }))
    },
    clearConsole () {
      var environment = JSON.parse(JSON.stringify(this.environment))
      environment[this.environmentType].console.data = []
      this.$store.dispatch('setEnvironment', environment).then((res) => {})
    },
    removeTab (targetName) {
      var editorState = JSON.parse(JSON.stringify(this.editorState))
      if (editorState.activeFile === targetName) {
        for (var i = 0; i < editorState.files.length; i++) {
          if (editorState.files[i].path === targetName) {
            editorState.activeFile = editorState.files[i + 1] ? editorState.files[i + 1].path : (editorState.files[i - 1] ? editorState.files[i - 1].path : '')
          }
        }
      }
      editorState.files = editorState.files.filter(tab => tab.path !== targetName)
      this.$store.dispatch('setEditorState', editorState).then((res) => {})
    },
    checkTab (path) {
      var editorState = JSON.parse(JSON.stringify(this.editorState))
      editorState.activeFile = path
      this.$store.dispatch('setEditorState', editorState).then((res) => {})
    },
    editing (path, index) {
      this.$nextTick(() => {
        // this.$refs.aceEditor[index].editor.find('test')
        var content = this.$refs.aceEditor[index].contentBackup
        var editorState = JSON.parse(JSON.stringify(this.editorState))
        for (var i = 0; i < editorState.files.length; i++) {
          if (editorState.files[i].path === path) {
            editorState.files[i].content = content
          }
        }
        for (var x = 0; x < editorState.tree.length; x++) {
          for (var y = 0; y < editorState.tree[x].children.length; y++) {
            if (editorState.tree[x].children[y].path === path) {
              editorState.tree[x].children[y].content = content
              break
            }
          }
        }
        this.$store.dispatch('setEditorState', editorState).then((res) => {})
      })
    },
    editorInit: function (editor) {
      require('brace/ext/language_tools')
      require('brace/mode/html')
      require('brace/mode/javascript')
      require('brace/theme/solarized_dark')
      require('brace/snippets/javascript')
      require('brace/snippets/autohotkey')
      var that = this
      editor.getSession().selection.on('changeCursor', function (e) {
        var environment = JSON.parse(JSON.stringify(that.environment))
        environment[that.environmentType].editorStatus = {
          row: editor.selection.getCursor().row,
          column: editor.selection.getCursor().column
        }
        that.$store.dispatch('setEnvironment', environment).then((res) => {})
      })
      editor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
        exec: function (edit) {
          // console.log(edit)
        },
        readOnly: true // false if this command should not apply in readOnly mode
      })
    }
  },
  watch: {
    tabIndex: {
      handler: function (newValue, oldValue) {
        var editorState = JSON.parse(JSON.stringify(this.editorState))
        editorState.files = JSON.parse(JSON.stringify(newValue))
        this.$store.dispatch('setEditorState', editorState).then((res) => {})
      },
      deep: true
    }
  }
}
</script>
<style lang="less" scoped>
  .edit-content{
    width: calc(100% - 544px);
    margin-top: 3px;
    margin-right: 2px;
    margin-left: 2px;
    position: relative;
    & .content-first{
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 80%;
      display: flex;
      flex-direction: column;
    }
    & .content-split{
      position: absolute;
      top: 80%;
      height: 6px;
      margin-top: -3px;
      left: 0;
      right: 0;
      z-index: 111;
      cursor: ns-resize;
    }
  }
  .ace-solarized-dark{background-color: #2C2D44;}
  .edit-bottom-status{
    background: #383956;
    height: 35px;
    line-height: 35px;
    padding: 0 10px 0 15px;
    margin-bottom: 2px;
    flex-shrink: 0;
    & .el-icon-delete{
      color: #666;
      font-size: 18px;
      line-height: 35px;
    }
    & span{
      padding-right: 5px;
    }
  }
</style>
