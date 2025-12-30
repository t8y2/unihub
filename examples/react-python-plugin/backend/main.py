#!/usr/bin/env python3
import sys
import json
import hashlib

def reverse(args):
    """反转文本"""
    data = json.loads(args)
    text = data.get('text', '')
    result = text[::-1]
    return json.dumps({
        'success': True,
        'result': result,
        'message': f'已反转 {len(text)} 个字符'
    })

def analyze(args):
    """分析文本"""
    data = json.loads(args)
    text = data.get('text', '')
    
    analysis = {
        'length': len(text),
        'words': len(text.split()),
        'lines': len(text.splitlines()),
        'uppercase': sum(1 for c in text if c.isupper()),
        'lowercase': sum(1 for c in text if c.islower()),
        'digits': sum(1 for c in text if c.isdigit()),
        'spaces': sum(1 for c in text if c.isspace())
    }
    
    return json.dumps({
        'success': True,
        'analysis': analysis
    }, indent=2)

def hash(args):
    """计算哈希值"""
    data = json.loads(args)
    text = data.get('text', '')
    
    hashes = {
        'md5': hashlib.md5(text.encode()).hexdigest(),
        'sha1': hashlib.sha1(text.encode()).hexdigest(),
        'sha256': hashlib.sha256(text.encode()).hexdigest()
    }
    
    return json.dumps({
        'success': True,
        'hashes': hashes
    }, indent=2)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': '参数不足'}))
        sys.exit(1)
    
    function_name = sys.argv[1]
    args = sys.argv[2]
    
    # 路由到对应的函数
    functions = {
        'reverse': reverse,
        'analyze': analyze,
        'hash': hash
    }
    
    if function_name in functions:
        result = functions[function_name](args)
        print(result)
    else:
        print(json.dumps({'error': f'未知函数: {function_name}'}))
        sys.exit(1)
