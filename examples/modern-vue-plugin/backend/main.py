#!/usr/bin/env python3
import sys
import json
import base64
import urllib.parse
import hashlib
import gzip
import zlib
from datetime import datetime

def base64_encode(args):
    """Base64 编码"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        encoded = base64.b64encode(text.encode('utf-8')).decode('utf-8')
        
        return json.dumps({
            'success': True,
            'result': encoded,
            'message': f'已编码 {len(text)} 个字符'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def base64_decode(args):
    """Base64 解码"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        decoded = base64.b64decode(text.encode('utf-8')).decode('utf-8')
        
        return json.dumps({
            'success': True,
            'result': decoded,
            'message': f'已解码为 {len(decoded)} 个字符'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': f'解码失败: {str(e)}'}, ensure_ascii=False)

def url_encode(args):
    """URL 编码"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        encoded = urllib.parse.quote(text, safe='')
        
        return json.dumps({
            'success': True,
            'result': encoded,
            'message': 'URL 编码完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def url_decode(args):
    """URL 解码"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        decoded = urllib.parse.unquote(text)
        
        return json.dumps({
            'success': True,
            'result': decoded,
            'message': 'URL 解码完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def caesar(args):
    """凯撒密码"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        shift = data.get('options', {}).get('shift', 3)
        
        result = ''
        for char in text:
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                shifted = (ord(char) - ascii_offset + shift) % 26
                result += chr(shifted + ascii_offset)
            else:
                result += char
        
        return json.dumps({
            'success': True,
            'result': result,
            'message': f'凯撒密码加密完成 (偏移: {shift})'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def rot13(args):
    """ROT13 加密"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        
        result = ''
        for char in text:
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                shifted = (ord(char) - ascii_offset + 13) % 26
                result += chr(shifted + ascii_offset)
            else:
                result += char
        
        return json.dumps({
            'success': True,
            'result': result,
            'message': 'ROT13 加密完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def reverse(args):
    """反转加密"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        result = text[::-1]
        
        return json.dumps({
            'success': True,
            'result': result,
            'message': '文本反转完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def hash_md5(args):
    """MD5 哈希"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        hash_value = hashlib.md5(text.encode('utf-8')).hexdigest()
        
        return json.dumps({
            'success': True,
            'result': hash_value,
            'message': 'MD5 哈希计算完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def hash_sha256(args):
    """SHA256 哈希"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        hash_value = hashlib.sha256(text.encode('utf-8')).hexdigest()
        
        return json.dumps({
            'success': True,
            'result': hash_value,
            'message': 'SHA256 哈希计算完成'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def gzip_compress(args):
    """Gzip 压缩"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        
        compressed = gzip.compress(text.encode('utf-8'))
        encoded = base64.b64encode(compressed).decode('utf-8')
        
        compression_ratio = len(compressed) / len(text.encode('utf-8')) * 100
        
        return json.dumps({
            'success': True,
            'result': encoded,
            'message': f'Gzip 压缩完成，压缩率: {compression_ratio:.1f}%'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def zlib_compress(args):
    """Zlib 压缩"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        
        compressed = zlib.compress(text.encode('utf-8'))
        encoded = base64.b64encode(compressed).decode('utf-8')
        
        compression_ratio = len(compressed) / len(text.encode('utf-8')) * 100
        
        return json.dumps({
            'success': True,
            'result': encoded,
            'message': f'Zlib 压缩完成，压缩率: {compression_ratio:.1f}%'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

def simple_compress(args):
    """简单压缩（去重复字符）"""
    try:
        data = json.loads(args)
        text = data.get('data', '')
        
        # 简单的行程编码
        if not text:
            return json.dumps({
                'success': True,
                'result': '',
                'message': '空文本，无需压缩'
            }, ensure_ascii=False)
        
        compressed = []
        current_char = text[0]
        count = 1
        
        for char in text[1:]:
            if char == current_char:
                count += 1
            else:
                if count > 1:
                    compressed.append(f"{current_char}{count}")
                else:
                    compressed.append(current_char)
                current_char = char
                count = 1
        
        # 处理最后一个字符
        if count > 1:
            compressed.append(f"{current_char}{count}")
        else:
            compressed.append(current_char)
        
        result = ''.join(compressed)
        compression_ratio = len(result) / len(text) * 100
        
        return json.dumps({
            'success': True,
            'result': result,
            'message': f'简单压缩完成，压缩率: {compression_ratio:.1f}%'
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': '参数不足'}, ensure_ascii=False))
        sys.exit(1)
    
    function_name = sys.argv[1]
    args = sys.argv[2]
    
    # 路由到对应的函数
    functions = {
        'base64_encode': base64_encode,
        'base64_decode': base64_decode,
        'url_encode': url_encode,
        'url_decode': url_decode,
        'caesar': caesar,
        'rot13': rot13,
        'reverse': reverse,
        'hash_md5': hash_md5,
        'hash_sha256': hash_sha256,
        'gzip': gzip_compress,
        'zlib': zlib_compress,
        'simple': simple_compress
    }
    
    if function_name in functions:
        result = functions[function_name](args)
        print(result)
    else:
        print(json.dumps({'success': False, 'error': f'未知函数: {function_name}'}, ensure_ascii=False))
        sys.exit(1)