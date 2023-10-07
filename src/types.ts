export type Reply = {
  /**
   * 评论 rpid
   */
  rpid: number;

  /**
   * 评论区对象 id
   */
  oid: number;

  /**
   * 评论区类型代码
   */
  type: number;

  /**
   * 根评论 rpid
   */
  root: number;

  /**
   * 评论的回复
   */
  replies: Reply[] | null;

  /**
   * 评论是否被隐藏
   */
  invisible: boolean;
}

// export const