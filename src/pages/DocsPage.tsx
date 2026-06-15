function DocsPage() {
  return (
    <main className="app-shell narrow">
      <section className="workbench">
        <p className="section-label">Docs</p>
        <h1>文档统一放在项目内</h1>
        <p className="summary compact">
          产品、设计和技术文档都归档到 docs 目录，避免散落在下载目录或临时输出目录。
        </p>
        <div className="doc-grid">
          <article>
            <strong>docs/product</strong>
            <span>PRD、需求补充、用户流程、功能说明</span>
          </article>
          <article>
            <strong>docs/design</strong>
            <span>视觉风格、交互原型、页面说明</span>
          </article>
          <article>
            <strong>docs/technical</strong>
            <span>技术方案、架构设计、数据结构、接口说明</span>
          </article>
        </div>
      </section>
    </main>
  )
}

export default DocsPage
