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

export class ResizeNearestNeighborOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): ResizeNearestNeighborOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsResizeNearestNeighborOptions(
      bb: flatbuffers.ByteBuffer,
      obj?: ResizeNearestNeighborOptions): ResizeNearestNeighborOptions {
    return (obj || new ResizeNearestNeighborOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsResizeNearestNeighborOptions(
      bb: flatbuffers.ByteBuffer,
      obj?: ResizeNearestNeighborOptions): ResizeNearestNeighborOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new ResizeNearestNeighborOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  alignCorners(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  static startResizeNearestNeighborOptions(builder: flatbuffers.Builder) {
    builder.startObject(1);
  }

  static addAlignCorners(builder: flatbuffers.Builder, alignCorners: boolean) {
    builder.addFieldInt8(0, +alignCorners, +false);
  }

  static endResizeNearestNeighborOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createResizeNearestNeighborOptions(builder: flatbuffers.Builder, alignCorners: boolean):
      flatbuffers.Offset {
    ResizeNearestNeighborOptions.startResizeNearestNeighborOptions(builder);
    ResizeNearestNeighborOptions.addAlignCorners(builder, alignCorners);
    return ResizeNearestNeighborOptions.endResizeNearestNeighborOptions(builder);
  }
}