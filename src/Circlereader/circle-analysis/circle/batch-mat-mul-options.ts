/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class BatchMatMulOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): BatchMatMulOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsBatchMatMulOptions(bb: flatbuffers.ByteBuffer, obj?: BatchMatMulOptions):
      BatchMatMulOptions {
    return (obj || new BatchMatMulOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsBatchMatMulOptions(
      bb: flatbuffers.ByteBuffer, obj?: BatchMatMulOptions): BatchMatMulOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new BatchMatMulOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  adjointLhs(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  adjointRhs(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  static startBatchMatMulOptions(builder: flatbuffers.Builder) {
    builder.startObject(2);
  }

  static addAdjointLhs(builder: flatbuffers.Builder, adjointLhs: boolean) {
    builder.addFieldInt8(0, +adjointLhs, +false);
  }

  static addAdjointRhs(builder: flatbuffers.Builder, adjointRhs: boolean) {
    builder.addFieldInt8(1, +adjointRhs, +false);
  }

  static endBatchMatMulOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createBatchMatMulOptions(
      builder: flatbuffers.Builder, adjointLhs: boolean, adjointRhs: boolean): flatbuffers.Offset {
    BatchMatMulOptions.startBatchMatMulOptions(builder);
    BatchMatMulOptions.addAdjointLhs(builder, adjointLhs);
    BatchMatMulOptions.addAdjointRhs(builder, adjointRhs);
    return BatchMatMulOptions.endBatchMatMulOptions(builder);
  }
}