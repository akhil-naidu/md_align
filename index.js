'use strict';

const eejs = require('md_mudoc-lite/node/eejs/');
const Changeset = require('md_mudoc-lite/static/js/Changeset');
const settings = require('md_mudoc-lite/node/utils/Settings');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  if (args.renderContext.isReadOnly) return cb();

  for (const button of ['alignLeft', 'alignJustify', 'alignCenter', 'alignRight']) {
    if (JSON.stringify(settings.toolbar).indexOf(button) > -1) {
      return cb();
    }
  }

  args.content += eejs.require('md_align/templates/editbarButtons.ejs');
  return cb();
};

const _analyzeLine = (alineAttrs, apool) => {
  let alignment = null;
  if (alineAttrs) {
    const opIter = Changeset.opIterator(alineAttrs);
    if (opIter.hasNext()) {
      const op = opIter.next();
      alignment = Changeset.opAttributeValue(op, 'align', apool);
    }
  }
  return alignment;
};

// line, apool,attribLine,text
exports.getLineHTMLForExport = async (hookName, context) => {
  const align = _analyzeLine(context.attribLine, context.apool);
  if (align) {
    if (context.text.indexOf('*') === 0) {
      context.lineContent = context.lineContent.replace('*', '');
    }
    const heading = context.lineContent.match(/<h([1-6])([^>]+)?>/);

    if (heading) {
      if (heading.indexOf('style=') === -1) {
        context.lineContent = context.lineContent.replace('>', ` style='text-align:${align}'>`);
      } else {
        context.lineContent = context.lineContent.replace('style=', `style='text-align:${align} `);
      }
    } else {
      context.lineContent =
        `<p style='text-align:${align}'>${context.lineContent}</p>`;
    }
    return context.lineContent;
  }
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;

  const alignLeftButton = toolbar.button({
    command: 'alignLeft',
    localizationId: 'md_align.toolbar.left.title',
    class: 'buttonicon buttonicon-align-left md_align md_align_left',
  });

  const alignCenterButton = toolbar.button({
    command: 'alignCenter',
    localizationId: 'md_align.toolbar.middle.title',
    class: 'buttonicon buttonicon-align-center md_align md_align_center',
  });

  const alignJustifyButton = toolbar.button({
    command: 'alignJustify',
    localizationId: 'md_align.toolbar.justify.title',
    class: 'buttonicon buttonicon-align-justify md_align md_align_justify',
  });

  const alignRightButton = toolbar.button({
    command: 'alignRight',
    localizationId: 'md_align.toolbar.right.title',
    class: 'buttonicon buttonicon-align-right md_align md_align_right',
  });

  toolbar.registerButton('alignLeft', alignLeftButton);
  toolbar.registerButton('alignCenter', alignCenterButton);
  toolbar.registerButton('alignJustify', alignJustifyButton);
  toolbar.registerButton('alignRight', alignRightButton);

  return cb();
};
