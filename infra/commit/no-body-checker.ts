/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

import {readFileSync, writeFileSync} from 'fs';

/**
 * Argument List
 *  - Commit Message
 */
var args = process.argv.slice(2)
const commitMsg = readFileSync(args[0], 'utf-8');

var isNoBody = true;
var messages = commitMsg.split(/\r\n|\r|\n/);

// Consider first line as title, not body
for (let lineNum = 1; lineNum < messages.length; ++lineNum)
{
    var msg = messages[lineNum];

    // Ignore Signed-off-by
    if (msg.includes("ONE-vscode-DCO-1.0-Signed-off-by"))
        continue;

    // If body only consists of blank, consider as empty body
    if (msg.split(' ').join('').length > 0)
    {
        isNoBody = false;
        break;
    }
}

if (isNoBody)
{
    writeFileSync('no_body_checker.fail', messages.length.toString() + commitMsg);
}
